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

from geosight.georepo.models import (
    ReferenceLayerViewTemp, ReferenceLayerViewLevelTemp, EntityTemp
)


class ReferenceLayerViewLevelInline(admin.TabularInline):
    """ReferenceLayerViewLevel inline."""

    model = ReferenceLayerViewLevelTemp
    extra = 0


class ReferenceLayerViewAdmin(admin.ModelAdmin):
    """ReferenceLayerView admin."""

    list_display = [
        'identifier', 'name', 'description'
    ]
    ordering = ['name']
    inlines = (ReferenceLayerViewLevelInline,)


class EntityAdmin(admin.ModelAdmin):
    """Entity admin."""

    list_display = [
        'pk', 'name', 'reference_layer', 'admin_level', 'concept_uuid',
        'geom_id', 'parents'
    ]
    ordering = ['reference_layer', 'admin_level', 'geom_id']
    list_filter = ['reference_layer', 'admin_level']
    search_fields = ['geom_id', 'concept_uuid']


admin.site.register(EntityTemp, EntityAdmin)
admin.site.register(ReferenceLayerViewTemp, ReferenceLayerViewAdmin)
