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

from geosight.data.models.code import Code, CodeList, CodeInCodeList


class CodeInCodeListInline(admin.TabularInline):
    """CodeInCodeList inline."""

    model = CodeInCodeList
    extra = 0


class CodeListAdmin(admin.ModelAdmin):
    """CodeList admin."""

    list_display = ('name', 'description')
    inlines = (CodeInCodeListInline,)


class CodeAdmin(admin.ModelAdmin):
    """Code admin."""

    list_display = ('code', 'label')


admin.site.register(CodeList, CodeListAdmin)
admin.site.register(Code, CodeAdmin)
