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

from geosight.data.models.style import Style, StyleRule


class StyleRuleInline(admin.TabularInline):
    """StyleRule inline."""

    model = StyleRule
    extra = 0


class StyleAdmin(admin.ModelAdmin):
    """Style admin."""

    list_display = ('name', 'description', 'group')
    inlines = (StyleRuleInline,)


admin.site.register(Style, StyleAdmin)
