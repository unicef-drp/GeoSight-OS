# coding=utf-8
"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-No-reply@unicef.org

.. Note:: This program is free software; you can redistribute it and/or modify
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
from django.contrib.admin import SimpleListFilter

from geosight.data.models.context_layer import ContextLayer

admin.site.unregister(Layer)


class HasContextLayerFilter(SimpleListFilter):
    """Filter if layer has context layer or Not."""

    title = 'Has Context Layer'
    parameter_name = 'has_context_layer'

    def lookups(self, request, model_admin):
        """Lookups for options."""
        return [
            ('Yes', 'Yes'),
            ('No', 'No'),
        ]

    def queryset(self, request, queryset):
        """Return queryset."""
        if self.value() == 'Yes':
            return queryset.filter(
                pk__in=ContextLayer.objects.all().values_list(
                    'cloud_native_gis_layer__pk', flat=True
                )
            )
        elif self.value() == 'No':
            return queryset.exclude(
                pk__in=ContextLayer.objects.all().values_list(
                    'cloud_native_gis_layer__pk', flat=True
                )
            )
        return queryset


@admin.register(Layer)
class LayerAdmin(LayerAdmin):
    """Layer admin."""

    list_display = (
        'unique_id', 'name', 'created_by', 'created_at',
        'is_ready', 'tile_url', 'editor', 'context_layer'
    )
    list_filter = (HasContextLayerFilter,)

    def context_layer(self, obj: Layer):
        """Return context_layer."""
        return obj.contextlayer.name
