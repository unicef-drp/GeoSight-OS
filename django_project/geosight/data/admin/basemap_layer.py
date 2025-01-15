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

from geosight.data.models.basemap_layer import (
    BasemapLayer, BasemapLayerParameter
)
from geosight.data.admin.base import BaseAdminResourceMixin


class BasemapLayerParameterInline(admin.TabularInline):
    """BasemapLayerParameter inline."""

    model = BasemapLayerParameter
    extra = 0


class BasemapLayerAdmin(BaseAdminResourceMixin):
    """BasemapLayer admin."""

    list_display = ('name', 'url', 'group') + BaseAdminResourceMixin.list_display  # noqa
    inlines = (BasemapLayerParameterInline,)
    list_editable = ('group', 'creator')
    readonly_fields = BaseAdminResourceMixin.readonly_fields


admin.site.register(BasemapLayer, BasemapLayerAdmin)
