# coding=utf-8
"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""
__author__ = 'irwan@kartoza.com'
__date__ = '13/06/2023'
__copyright__ = ('Copyright 2023, Unicef')

from django.contrib.auth import get_user_model
from django.contrib.gis.db.models import QuerySet
from django.db import models
from django.utils.translation import ugettext_lazy as _

from core.models.general import AbstractVersionData, AbstractEditData
from core.utils import is_valid_uuid
from geosight.data.models.indicator import Indicator
from geosight.georepo.request import (
    GeorepoRequest, GeorepoUrl, GeorepoRequestError
)
from geosight.georepo.request.data import GeorepoEntity
from geosight.permission.models.manager import PermissionManager

User = get_user_model()


class ReferenceLayerViewLocalQuerySet(QuerySet):
    """Queryset specifically for local reference layer."""

    pass


class ReferenceLayerViewPermissionManager(PermissionManager):
    """Reference layer view local manager."""

    def get_queryset(self):
        """Return queryset just for non georepo."""
        qs = ReferenceLayerViewLocalQuerySet(self.model, using=self._db)
        return qs.filter(in_georepo=False)

    def create(self, user: User, **kwargs):
        """Create function with user."""
        try:
            kwargs['identifier']
        except KeyError:
            kwargs['identifier'] = ReferenceLayerView.get_uuid()
        return super().create(user=user, **kwargs)


class ReferenceLayerView(AbstractEditData, AbstractVersionData):
    """Reference Layer view data."""

    identifier = models.CharField(
        max_length=256,
        help_text=_("Reference layer identifier.")
    )

    name = models.CharField(
        max_length=256,
        help_text=_("Reference layer name."),
        null=True, blank=True
    )

    description = models.TextField(
        null=True, blank=True
    )

    in_georepo = models.BooleanField(default=True)

    objects = models.Manager()
    permissions = ReferenceLayerViewPermissionManager()

    class Meta:  # noqa: D106
        indexes = [
            models.Index(
                fields=['identifier'],
                name='reference_layer_identifier'
            )
        ]

    def get_name(self):
        """Return name."""
        if not self.name:
            try:
                self.update_meta()
            except GeorepoRequestError:
                pass
        return self.name

    def __str__(self):
        """Return str."""
        return f'{self.get_name()} ({self.identifier})'

    @property
    def version_with_uuid(self):
        """Return version data."""
        return f'{self.identifier}-{self.version}'

    def save(self, *args, **kwargs):
        """On save method."""
        from geosight.georepo.tasks import fetch_reference_codes
        from geosight.georepo.tasks import (
            create_data_access_reference_layer_view
        )
        super(ReferenceLayerView, self).save(*args, **kwargs)
        if not self.name:
            self.get_name()
            fetch_reference_codes.delay(self.id)
            create_data_access_reference_layer_view.delay(self.id)

    def update_meta(self):
        """Update meta."""
        detail = GeorepoRequest().View.get_detail(self.identifier)
        self.name = detail['name']
        self.description = detail['description']
        self.in_georepo = True
        self.save()

    def full_name(self):
        """Return str."""
        return f'{self.get_name()} ({self.identifier})'

    def bbox(self):
        """Return bbox of reference layer."""
        return GeorepoRequest().View.get_reference_layer_bbox(self.identifier)

    def entities(self, level=None):
        """Return entities of reference layer view."""
        return GeorepoRequest().View.get_detail(self.identifier)

    def save_entity(self, entity: GeorepoEntity):
        """Save entities."""
        from geosight.georepo.models.entity import Entity, EntityCode
        entity = GeorepoEntity(entity)
        obj, _ = Entity.objects.get_or_create(
            reference_layer=self,
            admin_level=entity.admin_level,
            geom_id=entity.ucode,
            defaults={
                'concept_uuid': entity.concept_uuid,
                'start_date': entity.start_date
            }
        )

        obj.end_date = entity.end_date
        obj.parents = entity.parents
        obj.name = entity.name
        obj.save()
        for code_type, code in entity.ext_codes.items():
            entity_code, _ = EntityCode.objects.get_or_create(
                entity=obj,
                code_type=code_type,
                code=code
            )
        return obj

    def sync_entities_code(self, level=None):
        """Sync entities code."""
        detail = GeorepoRequest().View.get_detail(self.identifier)
        for dataset_level in detail['dataset_levels']:
            if level and dataset_level['level'] != level:
                continue
            entities = GeorepoRequest().View.entities(
                self.identifier, dataset_level['level']
            )
            for entity in entities:
                self.save_entity(entity)

    @property
    def detail_url(self):
        """Return API link for reference detail."""
        url = GeorepoUrl()
        return url.view_detail(self.identifier)

    @staticmethod
    def get_by_identifier(identifier):
        """Return get by indicator."""
        if is_valid_uuid(identifier):
            reference_layer, _ = ReferenceLayerView.objects.get_or_create(
                identifier=identifier
            )
            return reference_layer
        else:
            try:
                return ReferenceLayerView.objects.get(id=identifier)
            except ReferenceLayerView.DoesNotExist:
                return

    @property
    def levels(self):
        """Return level of reference layer."""
        return self.referencelayerviewlevel_set.order_by('level')

    @property
    def is_local(self):
        """Return if view is local or not."""
        return not self.in_georepo

    @staticmethod
    def get_uuid():
        """Return uuid of view."""
        from uuid import uuid4
        from geosight.georepo.models.reference_layer_temporary import (
            ReferenceLayerViewTemp
        )
        uuid = str(uuid4())
        if ReferenceLayerView.objects.filter(identifier=uuid).exists():
            return ReferenceLayerView.get_uuid()
        if ReferenceLayerViewTemp.objects.filter(identifier=uuid).exists():
            return ReferenceLayerView.get_uuid()
        return uuid


class ReferenceLayerViewLevel(models.Model):
    """Reference Layer view level."""

    reference_layer = models.ForeignKey(
        ReferenceLayerView, on_delete=models.CASCADE
    )

    level = models.IntegerField()
    name = models.CharField(
        max_length=256,
        help_text=_("Level name.")
    )

    class Meta:  # noqa: D106
        unique_together = ('reference_layer', 'level')


class ReferenceLayerIndicator(models.Model):
    """Reference Layer x Indicator data."""

    reference_layer = models.ForeignKey(
        ReferenceLayerView, on_delete=models.CASCADE
    )
    indicator = models.ForeignKey(
        Indicator, on_delete=models.CASCADE
    )

    objects = models.Manager()
    permissions = PermissionManager()

    class Meta:  # noqa: D106
        unique_together = ('reference_layer', 'indicator')

    @property
    def creator(self):
        """Return creator from the indicator."""
        return self.indicator.creator

    @property
    def created_at(self):
        """Return created time from the indicator."""
        return self.indicator.created_at

    @property
    def modified_at(self):
        """Return modified time from the indicator."""
        return self.indicator.modified_at
