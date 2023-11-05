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

from geosight.data.models.dashboard import (
    Dashboard, DashboardWidget,
    DashboardBasemap, DashboardIndicator, DashboardContextLayer,
    DashboardContextLayerField,
    DashboardIndicatorRule, DashboardBookmark,
    DashboardIndicatorLayer,
    DashboardIndicatorLayerIndicator,
    DashboardIndicatorLayerRelatedTable,
    DashboardRelatedTable
)


class DashboardWidgetInline(admin.StackedInline):
    """DashboardWidget inline."""

    model = DashboardWidget
    extra = 0


class DashboardBasemapInline(admin.TabularInline):
    """DashboardBasemap inline."""

    model = DashboardBasemap
    extra = 0


class DashboardIndicatorRuleInline(admin.TabularInline):
    """DashboardContextLayer inline."""

    model = DashboardIndicatorRule
    extra = 0


class DashboardIndicatorAdmin(admin.ModelAdmin):
    """DashboardIndicatorRule admin."""

    list_display = (
        'dashboard', 'object', 'visible_by_default', 'override_style'
    )
    list_filter = ('dashboard', 'object')
    inlines = (DashboardIndicatorRuleInline,)


class DashboardRelatedTableAdmin(admin.ModelAdmin):
    """DashboardRelatedTable admin."""

    list_display = (
        'dashboard', 'object', 'visible_by_default'
    )
    list_filter = ('dashboard', 'object')


class DashboardIndicatorLayerIndicatorInline(admin.StackedInline):
    """DashboardIndicatorLayerIndicator inline."""

    model = DashboardIndicatorLayerIndicator
    extra = 0


class DashboardIndicatorLayerRelatedTableInline(admin.StackedInline):
    """DashboardIndicatorLayerRelatedTable inline."""

    model = DashboardIndicatorLayerRelatedTable
    extra = 0


class DashboardIndicatorLayerAdmin(admin.ModelAdmin):
    """DashboardIndicatorLayer admin."""

    list_display = ('dashboard', 'label', 'visible_by_default')
    list_filter = ('dashboard',)
    inlines = (
        DashboardIndicatorLayerIndicatorInline,
        DashboardIndicatorLayerRelatedTableInline
    )


class DashboardContextLayerInline(admin.TabularInline):
    """DashboardContextLayer inline."""

    model = DashboardContextLayer
    extra = 0


class DashboardAdmin(admin.ModelAdmin):
    """Dashboard admin."""

    list_display = ('slug', 'name', 'creator', 'reference_layer')
    inlines = (
        DashboardBasemapInline,
        DashboardContextLayerInline,
        DashboardWidgetInline
    )
    prepopulated_fields = {'slug': ('name',)}


class DashboardContextLayerFieldInline(admin.TabularInline):
    """DashboardContextLayer inline."""

    model = DashboardContextLayerField
    extra = 0


class DashboardContextLayerAdmin(admin.ModelAdmin):
    """DashboardIndicatorRule admin."""

    list_display = ('dashboard', 'object', 'visible_by_default')
    list_filter = ('dashboard', 'object')
    inlines = (DashboardContextLayerFieldInline,)


class DashboardBookmarkAdmin(admin.ModelAdmin):
    """DashboardBookmark admin."""

    list_display = ('dashboard', 'name',)
    list_filter = ('dashboard',)
    filter_horizontal = ('selected_context_layers',)


admin.site.register(Dashboard, DashboardAdmin)
admin.site.register(DashboardContextLayer, DashboardContextLayerAdmin)
admin.site.register(DashboardIndicator, DashboardIndicatorAdmin)
admin.site.register(DashboardRelatedTable, DashboardRelatedTableAdmin)
admin.site.register(DashboardIndicatorLayer, DashboardIndicatorLayerAdmin)
admin.site.register(DashboardBookmark, DashboardBookmarkAdmin)
