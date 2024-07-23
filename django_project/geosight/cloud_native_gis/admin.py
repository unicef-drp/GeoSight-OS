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
__date__ = '23/07/2024'
__copyright__ = ('Copyright 2023, Unicef')

from cloud_native_gis.admin import LayerAdmin
from cloud_native_gis.models import Layer
from django.contrib import admin

admin.site.unregister(Layer)


@admin.register(Layer)
class LayerAdmin(LayerAdmin):
    """Layer admin."""

    list_display = (
        'unique_id', 'name', 'created_by', 'created_at',
        'is_ready', 'tile_url', 'editor', 'context_layer'
    )

    def context_layer(self, obj: Layer):
        """Return context_layer."""
        return obj.contextlayer.name
