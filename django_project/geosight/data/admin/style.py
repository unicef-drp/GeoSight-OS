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
from geosight.data.admin.base import BaseAdminResourceMixin
from geosight.data.models.style.raster import COGClassification
from geosight.data.tasks import recalculate_cog_classification


class StyleRuleInline(admin.TabularInline):
    """StyleRule inline."""

    model = StyleRule
    extra = 0


class StyleAdmin(BaseAdminResourceMixin):
    """Style admin."""

    list_display = ('name', 'description', 'group') + BaseAdminResourceMixin.list_display  # noqa
    inlines = (StyleRuleInline,)


def recalculate(modeladmin, request, queryset):
    """Recalculate COG classification."""
    for obj in queryset:
        recalculate_cog_classification(obj.id)


class COGClassificationAdmin(admin.ModelAdmin):
    """COGClassification admin."""

    list_display = ('url', 'type', 'number', 'min_value', 'max_value')
    list_filter = ('type',)
    search_fields = ('url',)
    actions = (recalculate,)


admin.site.register(Style, StyleAdmin)
admin.site.register(COGClassification, COGClassificationAdmin)
