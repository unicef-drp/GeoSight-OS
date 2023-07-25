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

from django.contrib.gis.db import models
from django.utils.translation import ugettext_lazy as _

from core.utils import is_valid_uuid
from geosight.data.models.indicator import Indicator
from geosight.georepo.request import (
    GeorepoRequest, GeorepoUrl, GeorepoRequestError
)
from geosight.georepo.request.data import GeorepoEntity
from geosight.permission.models.manager import PermissionManager


class ReferenceLayer(models.Model):
    """Dataset of georepo."""

    identifier = models.CharField(
        max_length=256,
        help_text=_("Reference layer identifier.")
    )

    name = models.CharField(
        max_length=256,
        help_text=_("Reference layer name."),
        null=True, blank=True
    )

    in_georepo = models.BooleanField(default=True)

    def __str__(self):
        """Return str."""
        return self.identifier


class ReferenceLayerView(models.Model):
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

    def __str__(self):
        """Return str."""
        return f'{self.name} ({self.identifier})'

    def save(self, *args, **kwargs):
        """On save method."""
        from geosight.georepo.tasks import fetch_reference_codes
        super(ReferenceLayerView, self).save(*args, **kwargs)
        if not self.name:
            try:
                self.update_meta()
            except GeorepoRequestError:
                pass
            fetch_reference_codes.delay(self.id)

    def update_meta(self):
        """Update meta."""
        detail = GeorepoRequest().View.get_detail(self.identifier)
        self.name = detail['name']
        self.description = detail['description']
        self.in_georepo = True
        self.save()

    def full_name(self):
        """Return str."""
        return f'{self.name} ({self.identifier})'

    def bbox(self):
        """Return bbox of reference layer."""
        return GeorepoRequest().View.get_reference_layer_bbox(self.identifier)

    def entities(self, level=None):
        """Return entities of reference layer view."""
        return GeorepoRequest().View.get_detail(self.identifier)

    def sync_entities_code(self, level=None):
        """Sync entities code."""
        from geosight.georepo.models.entity import Entity, EntityCode
        detail = GeorepoRequest().View.get_detail(self.identifier)
        for dataset_level in detail['dataset_levels']:
            if level and dataset_level['level'] != level:
                continue
            entities = GeorepoRequest().View.entities(
                self.identifier, dataset_level['level']
            )
            for entity in entities:
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
