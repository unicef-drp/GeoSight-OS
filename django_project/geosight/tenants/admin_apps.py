# coding=utf-8
"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""

from django.conf import settings
from django.contrib.admin import AdminSite
from django.contrib.admin.apps import AdminConfig
from django_tenants.utils import (
    get_tenant_model, get_public_schema_name
)


class TenantsAdminConfig(AdminConfig):
    """Admin config for tenants."""

    default_site = 'geosight.tenants.admin_apps.TenantsAdminSite'


class TenantsAdminSite(AdminSite):
    """Admin site for tenants."""

    def get_app_list(self, request):
        """Ger app list that can be shown on maintenants."""
        app_list = super().get_app_list(request)

        current_tenant = get_tenant_model().objects.get(
            schema_name=request.tenant.schema_name
        )

        # Check if it is main schema or not
        # Exclude the app needs to be
        if current_tenant.schema_name != get_public_schema_name():
            # Filter out apps to hide
            app_list = [
                app for app in app_list if
                app['app_label'] not in settings.TENANTS_SECRET_APPS
            ]

        return app_list
