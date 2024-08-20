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
__date__ = '02/05/2024'
__copyright__ = ('Copyright 2023, Unicef')

from django.contrib import admin
from django_tenants.admin import TenantAdminMixin

from geosight.tenants.models import Client, Domain, ModelDataLimitation


@admin.register(Client)
class ClientAdmin(TenantAdminMixin, admin.ModelAdmin):
    """Tenant admin."""

    list_display = ('name', 'schema_name')


@admin.register(Domain)
class DomainAdmin(TenantAdminMixin, admin.ModelAdmin):
    """Domain admin."""

    list_display = ('domain', 'tenant', 'schema_name', 'is_primary')


@admin.register(ModelDataLimitation)
class ModelDataLimitationAdmin(TenantAdminMixin, admin.ModelAdmin):
    """ModelDataLimitation admin."""

    list_display = (
        'tenant', 'content_type', 'model_field_group', 'limit', 'description'
    )
    list_filter = (
        'tenant', 'content_type', 'model_field_group'
    )
