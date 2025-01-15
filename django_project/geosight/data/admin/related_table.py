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
from django.utils import timezone

from geosight.data.models.related_table import (
    RelatedTable, RelatedTableRow, RelatedTableField
)
from geosight.importer.models.attribute import ImporterAttribute
from geosight.data.admin.base import BaseAdminResourceMixin


@admin.action(description='Invalidate cache')
def invalidate_cache(modeladmin, request, queryset):
    """Invalidate cache of value on frontend."""
    queryset.update(version_data=timezone.now())


@admin.action(description='Change non to empty sting')
def make_none_to_empty_string(modeladmin, request, queryset):
    """Change non to empty string."""
    for query in queryset:
        query.make_none_to_empty_string()


class RelatedTableFieldInline(admin.TabularInline):
    """RelatedTableField inline."""

    model = RelatedTableField
    extra = 0


@admin.register(RelatedTableRow)
class RelatedTableRowAdmin(admin.ModelAdmin):
    """RelatedTableRow admin."""

    list_display = ('table', 'order')
    list_editable = ('order',)


@admin.register(RelatedTable)
class RelatedTableAdmin(BaseAdminResourceMixin):
    """RelatedTable admin."""

    list_display = (
        'name', 'description',
        'importer'
    ) + BaseAdminResourceMixin.list_display
    inlines = (RelatedTableFieldInline,)
    actions = (invalidate_cache, make_none_to_empty_string)
    readonly_fields = ('last_importer',)

    def importer(self, obj: RelatedTable):
        """Return importer from this RT."""
        attribute = ImporterAttribute.objects.filter(
            name='related_table_id'
        ).filter(
            value=obj.id
        ).first()
        if attribute:
            return attribute.importer
        return None
