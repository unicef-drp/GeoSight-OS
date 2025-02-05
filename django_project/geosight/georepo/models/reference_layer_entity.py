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
__date__ = '04/02/2025'
__copyright__ = ('Copyright 2023, Unicef')

from django.contrib.gis.db import models

from geosight.georepo.models.entity import Entity
from geosight.georepo.models.reference_layer import ReferenceLayerView


class ReferenceLayerViewEntity(models.Model):
    """ReferenceLayerView data."""

    entity = models.ForeignKey(
        Entity, on_delete=models.CASCADE
    )
    reference_layer = models.ForeignKey(
        ReferenceLayerView, on_delete=models.CASCADE
    )

    class Meta:  # noqa: D106
        verbose_name_plural = "reference layer view entities"
        indexes = [
            models.Index(
                fields=['entity', 'reference_layer'],
                name='reference_layer_entity'
            ),
        ]
