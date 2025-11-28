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

from geosight.data.admin.base import BaseAdminResourceMixin, invalidate_cache
from geosight.data.models.related_table import (
    RelatedTable, RelatedTableRow, RelatedTableField
)
from geosight.importer.models.attribute import ImporterAttribute


@admin.action(description='Change non to empty sting')
def make_none_to_empty_string(modeladmin, request, queryset):
    """
    Change None values to empty strings in selected RelatedTable instances.

    Iterates through the queryset and calls make_none_to_empty_string()
    on each RelatedTable instance to convert None values to empty strings.

    :param modeladmin: The admin model instance associated with this action.
    :type modeladmin: django.contrib.admin.ModelAdmin
    :param request: The current HTTP request object.
    :type request: django.http.HttpRequest
    :param queryset: The queryset of selected RelatedTable objects.
    :type queryset: django.db.models.QuerySet
    """
    for query in queryset:
        query.make_none_to_empty_string()


class RelatedTableFieldInline(admin.TabularInline):
    """
    Inline admin interface for RelatedTableField model.

    Displays RelatedTableField entries as a tabular inline within the
    RelatedTable admin page, allowing management of fields associated
    with a related table.
    """

    model = RelatedTableField
    extra = 0


@admin.register(RelatedTableRow)
class RelatedTableRowAdmin(admin.ModelAdmin):
    """
    Django admin configuration for RelatedTableRow model.

    Provides admin interface for managing individual rows within related
    tables. Allows inline editing of the row order.
    """

    list_display = ('table', 'order')
    list_editable = ('order',)


@admin.register(RelatedTable)
class RelatedTableAdmin(BaseAdminResourceMixin):
    """
    Django admin configuration for RelatedTable model.

    Provides comprehensive admin interface for managing related tables,
    including their fields, metadata, and associated importers. Extends
    BaseAdminResourceMixin to track creator and modification information.
    Includes inline editing of related table fields and actions for cache
    invalidation and data cleanup.
    """

    list_display = (
                       'name', 'description',
                       'importer'
                   ) + BaseAdminResourceMixin.list_display
    inlines = (RelatedTableFieldInline,)
    actions = (invalidate_cache, make_none_to_empty_string)
    readonly_fields = ('last_importer',) + BaseAdminResourceMixin.readonly_fields  # noqa

    def importer(self, obj: RelatedTable):
        """
        Get the importer associated with this RelatedTable.

        Looks up the ImporterAttribute with name 'related_table_id' that
        references this RelatedTable's ID and returns the associated importer.

        :param obj: The RelatedTable instance.
        :type obj: RelatedTable
        :return: The importer instance if found, None otherwise.
        :rtype: geosight.importer.models.Importer or None
        """
        attribute = ImporterAttribute.objects.filter(
            name='related_table_id'
        ).filter(
            value=obj.id
        ).first()
        if attribute:
            return attribute.importer
        return None
