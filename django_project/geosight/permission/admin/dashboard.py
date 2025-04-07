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

from geosight.permission.admin.permission import AbstractPermissionAdmin
from geosight.permission.models import (
    DashboardPermission, DashboardUserPermission, DashboardGroupPermission
)


class UserPermissionInline(admin.TabularInline):
    """UserPermission inline."""

    model = DashboardUserPermission
    extra = 0


class GroupPermissionInline(admin.TabularInline):
    """GroupPermission inline."""

    model = DashboardGroupPermission
    extra = 0


class PermissionAdmin(AbstractPermissionAdmin):
    """Permission admin."""

    inlines = (UserPermissionInline, GroupPermissionInline)


admin.site.register(DashboardPermission, PermissionAdmin)
