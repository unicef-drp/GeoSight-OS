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

from django.contrib import admin

from geosight.data.models.indicator.indicator_value import (
    IndicatorValueWithGeo
)
from geosight.georepo.models import (
    ReferenceLayerView
)
from geosight.georepo.tasks import (
    fetch_reference_codes, fetch_datasets,
    create_data_access
)


@admin.action(description='Update meta')
def update_meta(modeladmin, request, queryset):
    """Fetch new reference layer."""
    for reference_layer in queryset:
        reference_layer.update_meta()


@admin.action(description='Sync entities')
def sync_codes(modeladmin, request, queryset):
    """Fetch new reference layer."""
    for reference_layer in queryset:
        fetch_reference_codes.delay(reference_layer.id)


@admin.action(description='Fetch new reference layer view')
def action_fetch_datasets(modeladmin, request, queryset):
    """Fetch new reference layer."""
    fetch_datasets.delay()


@admin.action(description='Create all data access')
def action_create_data_access(modeladmin, request, queryset):
    """Fetch new reference layer."""
    create_data_access.delay()


class ReferenceLayerViewAdmin(admin.ModelAdmin):
    """ReferenceLayerView admin."""

    list_display = [
        'identifier', 'name', 'description', 'in_georepo', 'number_of_value'
    ]
    ordering = ['name']
    actions = [
        update_meta, sync_codes, action_fetch_datasets,
        action_create_data_access
    ]

    def in_georepo(self, obj: ReferenceLayerView):
        """Is reference layer in georepo."""
        if obj.in_georepo:
            return '✓'
        return '✕'

    def number_of_value(self, obj: ReferenceLayerView):
        """Return number of value for this reference layer."""
        return IndicatorValueWithGeo.objects.filter(
            reference_layer_id=obj.id
        ).count()


admin.site.register(ReferenceLayerView, ReferenceLayerViewAdmin)
