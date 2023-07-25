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


class FieldLayerAbstract(models.Model):
    """Field data of layer."""

    name = models.CharField(
        max_length=512
    )
    alias = models.CharField(
        max_length=512
    )
    visible = models.BooleanField(
        default=True
    )
    type = models.CharField(
        max_length=512,
        default='string'
    )
    order = models.IntegerField(
        default=0
    )
    as_label = models.BooleanField(
        default=False
    )

    class Meta:  # noqa: D106
        abstract = True
