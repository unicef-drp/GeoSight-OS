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
__date__ = '22/08/2023'
__copyright__ = ('Copyright 2023, Unicef')

from django.contrib import admin

from docs.models import (
    Preferences, Block, Page, PageBlock, BlockChild
)


class PreferencesAdmin(admin.ModelAdmin):
    """Documentation preferences admin."""

    fieldsets = (
        (None, {
            'fields': ('documentation_base_url',)
        }),
    )


class PageBlockInline(admin.TabularInline):
    """PageBlock inline."""

    model = PageBlock
    extra = 1


class PageAdmin(admin.ModelAdmin):
    """Page admin."""

    list_display = ('name', 'relative_url')
    inlines = (PageBlockInline,)


class BlockChildInline(admin.TabularInline):
    """BlockChild inline."""

    fk_name = "parent"
    model = BlockChild
    extra = 1


class BlockAdmin(admin.ModelAdmin):
    """Block admin."""

    list_filter = ('url', 'anchor')
    inlines = (BlockChildInline,)


admin.site.register(Preferences, PreferencesAdmin)
admin.site.register(Page, PageAdmin)
admin.site.register(Block, BlockAdmin)
