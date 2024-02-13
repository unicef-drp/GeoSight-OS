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

from geosight.georepo.models.reference_layer_importer import (
    ReferenceLayerViewImporter
)


class ReferenceLayerViewTemp(models.Model):
    """Reference Layer view data."""

    importer = models.ForeignKey(
        ReferenceLayerViewImporter, on_delete=models.CASCADE
    )

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

    def __str__(self):
        """Return str."""
        return f'{self.name} ({self.identifier})'


class ReferenceLayerViewLevelTemp(models.Model):
    """Reference Layer view level."""

    reference_layer = models.ForeignKey(
        ReferenceLayerViewTemp, on_delete=models.CASCADE
    )

    level = models.IntegerField()
    name = models.CharField(
        max_length=256,
        help_text=_("Level name.")
    )

    class Meta:  # noqa: D106
        unique_together = ('reference_layer', 'level')


class EntityTemp(models.Model):
    """Entity data."""

    parents = models.JSONField(
        help_text='List of parents, ordered by most bottom to top.',
        null=True, blank=True
    )

    reference_layer = models.ForeignKey(
        ReferenceLayerViewTemp,
        help_text=_('Reference layer.'),
        on_delete=models.CASCADE
    )
    admin_level = models.IntegerField(
        null=True, blank=True
    )

    # This is geom id for the value
    geom_id = models.CharField(
        max_length=256,
        help_text='This is ucode from georepo.'
    )
    # This is concept uuid for the value
    concept_uuid = models.CharField(
        max_length=256,
        help_text='This is concept uuid from georepo.',
        null=True, blank=True
    )

    # Name of entity
    name = models.CharField(
        max_length=512,
        help_text='label of entity.'
    )

    # Geometry field
    geometry = models.GeometryField()
    centroid = models.PointField()
