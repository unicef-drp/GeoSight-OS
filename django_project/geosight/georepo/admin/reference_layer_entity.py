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

from django.contrib import admin

from geosight.georepo.models import (
    ReferenceLayerViewEntity
)


@admin.register(ReferenceLayerViewEntity)
class ReferenceLayerViewEntityAdmin(admin.ModelAdmin):
    """ReferenceLayerViewEntity admin."""

    list_display = ['entity', 'reference_layer_view']
    ordering = ['entity']
    list_filter = ['reference_layer_view']
