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
__date__ = '28/08/2024'
__copyright__ = ('Copyright 2023, Unicef')

from django.contrib import admin
from django_tenants.admin import TenantAdminMixin

from geosight.tenants.models import (
    Tenant, Domain, ContentLimitation, ContentLimitationTenant
)
from geosight.tenants.utils import is_public_tenant


class TenantModelAdmin(admin.ModelAdmin):
    """Tenant that give access to just for public tenant."""

    def has_view_permission(self, request, obj=None):
        """Has view permission."""
        if not is_public_tenant(request):
            return False
        return super().has_view_permission(request, obj)

    def has_add_permission(self, request):
        """Has add permission."""
        if not is_public_tenant(request):
            return False
        return super().has_add_permission(request)

    def has_change_permission(self, request, obj=None):
        """Has change permission."""
        if not is_public_tenant(request):
            return False
        return super().has_change_permission(request, obj)

    def has_delete_permission(self, request, obj=None):
        """Has delete permission."""
        if not is_public_tenant(request):
            return False
        return super().has_delete_permission(request, obj)

    def has_module_permission(self, request):
        """Has module permission."""
        if not is_public_tenant(request):
            return False
        return super().has_module_permission(request)


@admin.register(Tenant)
class TenantAdmin(TenantAdminMixin, TenantModelAdmin):
    """Tenant admin."""

    list_display = ('name', 'schema_name', 'responder_email')


@admin.register(Domain)
class DomainAdmin(TenantAdminMixin, TenantModelAdmin):
    """Domain admin."""

    list_display = ('domain', 'tenant', 'schema_name', 'is_primary')


@admin.register(ContentLimitation)
class ContentLimitationAdmin(TenantAdminMixin, TenantModelAdmin):
    """ContentLimitation admin."""

    list_display = (
        'content_type', 'model_field_group', 'description'
    )
    list_filter = ('content_type',)


@admin.register(ContentLimitationTenant)
class ContentLimitationTenantAdmin(TenantAdminMixin, TenantModelAdmin):
    """ContentLimitation admin."""

    list_display = (
        'tenant', 'content_limitation', 'limit'
    )
    list_filter = (
        'tenant', 'content_limitation'
    )
