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

from geosight.importer.models import (
    Importer, ImporterAttribute, ImporterMapping,
    ImporterLog, ImporterAlert, ImporterLogDataSaveProgress
)
from geosight.importer.tasks import (
    run_importer,
    calculate_data_counts
)


def import_data(modeladmin, request, queryset):
    """Run importers."""
    for importer in queryset:
        run_importer.delay(importer.id)


import_data.short_description = 'Run import data'


class ImporterAlertInline(admin.TabularInline):
    """ImporterAlert inline."""

    model = ImporterAlert
    fields = ('email', 'on_start', 'on_success', 'on_failure')
    extra = 0


class ImporterLogDataSaveProgressInline(admin.TabularInline):
    """ImporterLogDataSaveProgress inline."""

    model = ImporterLogDataSaveProgress
    fields = ('target_ids', 'saved_ids', 'done')
    extra = 0


class ImporterAttributeInline(admin.TabularInline):
    """ImporterAttribute inline."""

    model = ImporterAttribute
    fields = ('value', 'file')
    readonly_fields = ('name',)
    extra = 0

    def has_add_permission(self, request, obj=None):
        """Has add permission."""
        return False


class ImporterMappingInline(admin.TabularInline):
    """ImporterMapping inline."""

    model = ImporterMapping
    fields = ('name', 'value')
    extra = 0

    def has_add_permission(self, request, obj=None):
        """Has add permission."""
        return False


@admin.register(Importer)
class ImporterAdmin(admin.ModelAdmin):
    """Importer Admin."""

    actions = (import_data,)
    inlines = [
        ImporterAlertInline, ImporterAttributeInline, ImporterMappingInline
    ]
    list_display = (
        'id', 'unique_id', 'creator', 'import_type',
        'input_format', 'schedule_type', 'job_active'
    )
    list_filter = ('import_type', 'input_format',)
    readonly_fields = ('unique_id',)
    search_fields = ('unique_id',)


def recalculate_data_count(modeladmin, request, queryset):
    """Recalculate Importer Log Data count."""
    for obj in queryset:
        calculate_data_counts(obj.id)


@admin.register(ImporterLog)
class ImporterLogAdmin(admin.ModelAdmin):
    """ImporterLog Admin."""

    list_display = ('importer', 'start_time', 'end_time', 'status', 'note')
    readonly_fields = ('importer', 'start_time', 'end_time')
    list_filter = ('status',)
    inlines = [ImporterLogDataSaveProgressInline]
    search_fields = ('note', 'importer__unique_id')
    actions = (recalculate_data_count,)

    def has_add_permission(self, request, obj=None):
        """Has add permission."""
        return False
