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

from django.contrib import admin

from geosight.georepo.models import (
    ReferenceLayerViewImporter, ReferenceLayerViewImporterLevel
)


@admin.action(description='Run')
def run_importer(modeladmin, request, queryset):
    """Run an importer."""
    for importer in queryset:
        importer.run()


class ReferenceLayerViewImporterLevelInline(admin.TabularInline):
    """ReferenceLayerViewImporterLevel inline."""

    model = ReferenceLayerViewImporterLevel
    extra = 0


class ReferenceLayerViewImporterAdmin(admin.ModelAdmin):
    """ReferenceLayerViewImporter admin."""

    list_display = [
        'name', 'created_at', 'creator', 'status', 'progress'
    ]
    inlines = (ReferenceLayerViewImporterLevelInline,)
    actions = (run_importer,)


admin.site.register(
    ReferenceLayerViewImporter, ReferenceLayerViewImporterAdmin
)
