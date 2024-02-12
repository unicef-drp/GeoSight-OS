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
__date__ = '12/02/2024'
__copyright__ = ('Copyright 2023, Unicef')

from django.contrib.gis.db import models
from django.contrib.gis.db.models import QuerySet


class ReferenceLayerViewLocalQuerySet(QuerySet):
    """Queryset specifically for local reference layer."""

    pass


class ReferenceLayerViewLocalManager(models.Manager):
    """Reference layer view local manager."""

    def get_queryset(self):
        """Return queryset just for non georepo."""
        qs = ReferenceLayerViewLocalQuerySet(self.model, using=self._db)
        return qs.filter(in_georepo=False)
