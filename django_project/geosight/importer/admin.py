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
    run_save_log_data,
    calculate_data_counts
)


def import_data(modeladmin, request, queryset):
    """
    Trigger asynchronous import tasks for selected importer objects.

    This admin action enqueues background jobs to run the import process
    for each importer in the provided queryset.

    :param modeladmin: The ModelAdmin instance handling the request.
    :type modeladmin: ModelAdmin
    :param request: The HTTP request that initiated the action.
    :type request: HttpRequest
    :param queryset: A queryset of importer objects to run importers on.
    :type queryset: QuerySet[Importer]
    """
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
        """
        Determine whether the user has permission to add a new object.

        :param request: The HTTP request instance.
        :type request: HttpRequest
        :param obj: The object being added or `None` when adding a new object.
        :type obj: Model or None
        :return: `False` indicating that add permission is denied.
        :rtype: bool
        """
        return False


class ImporterMappingInline(admin.TabularInline):
    """ImporterMapping inline."""

    model = ImporterMapping
    fields = ('name', 'value')
    extra = 0

    def has_add_permission(self, request, obj=None):
        """
        Determine whether the user has permission to add a new object.

        :param request: The HTTP request instance.
        :type request: HttpRequest
        :param obj: The object being added or `None` when adding a new object.
        :type obj: Model or None
        :return: `False` indicating that add permission is denied.
        :rtype: bool
        """
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
    """
    Recalculate data counts for selected Importer Log Data objects.

    This admin action triggers the recalculation of data-related counts
    for each object in the provided queryset.

    :param modeladmin: The ModelAdmin instance handling the request.
    :type modeladmin: ModelAdmin
    :param request: The HTTP request that initiated the action.
    :type request: HttpRequest
    :param queryset:
        A queryset of objects for which data counts will be recalculated.
    :type queryset: QuerySet[ImporterLogData]
    """
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
        """
        Determine whether the user has permission to add a new object.

        :param request: The HTTP request instance.
        :type request: HttpRequest
        :param obj: The object being added or `None` when adding a new object.
        :type obj: Model or None
        :return: `False` indicating that add permission is denied.
        :rtype: bool
        """
        return False


def run_save_progress(modeladmin, request, queryset):
    """
    Trigger asynchronous saving of log data for each selected progress item.

    This admin action enqueues background tasks to process and save data
    for each object in the given queryset using Celery.

    :param modeladmin: The current ModelAdmin instance.
    :type modeladmin: ModelAdmin
    :param request: The current HTTP request.
    :type request: HttpRequest
    :param queryset:
        A queryset of ImporterLogDataSaveProgress instances to process.
    :type queryset: QuerySet[ImporterLogDataSaveProgress]
    """
    for progress in queryset:
        run_save_log_data.delay(progress.id)


@admin.register(ImporterLogDataSaveProgress)
class ImporterLogDataSaveProgressAdmin(admin.ModelAdmin):
    """ImporterLogDataSaveProgress Admin."""

    list_display = ('log', 'note', 'done', 'progress')
    actions = (run_save_progress,)

    def progress(self, obj: ImporterLogDataSaveProgress):
        """
        Calculate and return the current progress as a percentage string.

        :param obj:
            The object containing saved and target IDs for progress tracking.
        :type obj: ImporterLogDataSaveProgress
        :return:
            A string representing the progress percentage (e.g., "75.00%").
        :rtype: str
        """
        return f'{len(obj.saved_ids) / len(obj.target_ids) * 100}%'

    def has_add_permission(self, request, obj=None):
        """
        Determine whether the user has permission to add a new object.

        :param request: The HTTP request instance.
        :type request: HttpRequest
        :param obj: The object being added or `None` when adding a new object.
        :type obj: Model or None
        :return: `False` indicating that add permission is denied.
        :rtype: bool
        """
        return False
