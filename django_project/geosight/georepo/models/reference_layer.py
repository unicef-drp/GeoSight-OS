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

import logging

from django.contrib.auth import get_user_model
from django.db import models
from django.db.models import Max, Subquery
from django.utils.translation import ugettext_lazy as _

from core.models.general import AbstractVersionData, AbstractEditData
from geosight.data.models.indicator import Indicator
from geosight.georepo.request import (
    GeorepoRequest, GeorepoUrl, GeorepoRequestError
)
from geosight.georepo.request.data import GeorepoEntity
from geosight.georepo.term import admin_level_country
from geosight.permission.models.manager import PermissionManager

User = get_user_model()

logger = logging.getLogger(__name__)


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

    # Country
    countries = models.ManyToManyField(
        'geosight_georepo.Entity',
        help_text=_('The country of the view.'),
        null=True
    )

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
        from geosight.georepo.models.entity import EntityCode
        georepo_entity = GeorepoEntity(entity)
        obj, _ = GeorepoEntity(entity).get_or_create(self)
        for code_type, code in georepo_entity.ext_codes.items():
            entity_code, _ = EntityCode.objects.get_or_create(
                entity=obj,
                code_type=code_type,
                code=code
            )
        return obj

    def sync_entities_code(self, level=None, sync_all=True):
        """Sync entities code."""
        min_level = None
        if not sync_all:
            try:
                min_level = self.entities_set.aggregate(
                    Max('admin_level')
                )['admin_level__max']
            except KeyError:
                pass
        detail = GeorepoRequest().View.get_detail(self.identifier)
        logger.debug(f"Fetching entities: {self.identifier}")
        for dataset_level in detail['dataset_levels']:
            if level and dataset_level['level'] != level:
                continue
            if min_level is not None and dataset_level['level'] <= min_level:
                continue
            logger.debug(
                f"Fetching entities: "
                f"{self.identifier}-{dataset_level['level']}"
            )
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

    @property
    def is_local(self):
        """Return if view is local or not."""
        return not self.in_georepo

    @property
    def entities_set(self):
        """Querying entities."""
        from geosight.georepo.models.entity import Entity
        related_entities = self.referencelayerviewentity_set.values(
            "entity_id"
        )
        return Entity.objects.filter(pk__in=Subquery(related_entities))

    def assign_countries(self):
        """Assign countries."""
        self.countries.set(
            self.entities_set.filter(admin_level=admin_level_country)
        )
        self.save()

    def assign_country(self, entity, check_entity=True):
        """Assign country to the reference layer view."""
        if entity.admin_level == admin_level_country:
            if (
                    not check_entity or
                    self.entities_set.filter(id=entity.id).exists()
            ):
                self.countries.add(entity)


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
