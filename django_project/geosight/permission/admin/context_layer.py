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

from geosight.permission.models import (
    ContextLayerPermission, ContextLayerUserPermission,
    ContextLayerGroupPermission
)


class UserPermissionInline(admin.TabularInline):
    """UserPermission inline."""

    model = ContextLayerUserPermission
    extra = 0


class GroupPermissionInline(admin.TabularInline):
    """GroupPermission inline."""

    model = ContextLayerGroupPermission
    extra = 0


class PermissionAdmin(admin.ModelAdmin):
    """Permission admin."""

    list_display = ('obj', 'organization_permission', 'public_permission')
    inlines = (UserPermissionInline, GroupPermissionInline)
    read_only = ('obj',)


admin.site.register(ContextLayerPermission, PermissionAdmin)
