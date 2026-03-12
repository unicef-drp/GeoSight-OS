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
__date__ = '22/02/2024'
__copyright__ = ('Copyright 2023, Unicef')

from django.contrib import admin

from geosight.data.admin.base import BaseAdminResourceMixin
from geosight.reference_dataset.models import (
    ReferenceDatasetImporter, ReferenceDatasetImporterLevel
)


@admin.action(description='Run')
def run_importer(modeladmin, request, queryset):
    """Run the selected importers from the Django admin action.

    :param modeladmin: The current ModelAdmin instance.
    :type modeladmin: django.contrib.admin.ModelAdmin
    :param request: The current HTTP request.
    :type request: django.http.HttpRequest
    :param queryset: The queryset of selected ReferenceDatasetImporter objects.
    :type queryset: django.db.models.QuerySet
    """
    for importer in queryset:
        importer.run()


class ReferenceDatasetImporterLevelInline(admin.TabularInline):
    """ReferenceDatasetImporterLevel inline."""

    model = ReferenceDatasetImporterLevel
    extra = 0


class ReferenceDatasetImporterAdmin(admin.ModelAdmin):
    """ReferenceDatasetImporter admin."""

    list_display = (
                       'created_at', 'creator', 'status', 'progress'
                   ) + BaseAdminResourceMixin.list_display
    inlines = (ReferenceDatasetImporterLevelInline,)
    actions = BaseAdminResourceMixin.actions + (run_importer,)


admin.site.register(
    ReferenceDatasetImporter, ReferenceDatasetImporterAdmin
)
