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

from geosight.data.models.indicator import (
    Indicator, IndicatorGroup,
    IndicatorValue, IndicatorRule, IndicatorExtraValue
)


class IndicatorExtraValueRuleInline(admin.TabularInline):
    """IndicatorExtraValue inline."""

    model = IndicatorExtraValue
    extra = 0


class IndicatorValueAdmin(admin.ModelAdmin):
    """IndicatorValue admin."""

    list_display = ('indicator', 'date', 'value', 'geom_id')
    list_filter = ('indicator', 'date')
    search_fields = ('indicator__name', 'geom_id')
    inlines = (IndicatorExtraValueRuleInline,)


class IndicatorRuleInline(admin.TabularInline):
    """IndicatorRule inline."""

    model = IndicatorRule
    extra = 0


@admin.action(description='Invalidate cache')
def invalidate_cache(modeladmin, request, queryset):
    """Invalidate cache of value on frontend."""
    queryset.update(version_data=timezone.now())


class IndicatorAdmin(admin.ModelAdmin):
    """Indicator admin."""

    list_display = ('name', 'group', 'creator', 'type', 'created_at')
    list_filter = ('group',)
    list_editable = ('creator', 'group', 'type')
    search_fields = ('name',)
    inlines = (IndicatorRuleInline,)
    actions = (invalidate_cache,)


class IndicatorGroupAdmin(admin.ModelAdmin):
    """IndicatorGroup admin."""

    list_display = ('name',)


admin.site.register(IndicatorGroup, IndicatorGroupAdmin)
admin.site.register(IndicatorValue, IndicatorValueAdmin)
admin.site.register(Indicator, IndicatorAdmin)
