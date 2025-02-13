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

from geosight.data.models.context_layer import (
    ContextLayerGroup,
    ContextLayer,
    ContextLayerField,
    ZonalAnalysis
)
from geosight.data.admin.base import BaseAdminResourceMixin


class ContextLayerFieldInline(admin.TabularInline):
    """ContextLayerField inline."""

    model = ContextLayerField
    extra = 0


class ContextLayerAdmin(BaseAdminResourceMixin):
    """ContextLayer admin."""

    list_display = (
        'name', 'layer_type', 'group', 'url'
    ) + BaseAdminResourceMixin.list_display
    inlines = (ContextLayerFieldInline,)
    list_filter = ('group',)
    list_editable = ('group', 'creator')


class ContextLayerGroupAdmin(admin.ModelAdmin):
    """ContextLayerGroup admin."""

    list_display = ('name',)


class ZonalAnalysisAdmin(BaseAdminResourceMixin):
    """ZonalAnalysisAdmin admin."""

    list_display = (
        'uuid', 'context_layer', 'status', 'aggregation', 'result'
    ) + BaseAdminResourceMixin.list_display
    list_filter = ('status',)

admin.site.register(ContextLayerGroup, ContextLayerGroupAdmin)
admin.site.register(ContextLayer, ContextLayerAdmin)
admin.site.register(ZonalAnalysis, ZonalAnalysisAdmin)
