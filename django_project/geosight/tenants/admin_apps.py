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

from django.conf import settings
from django.contrib.admin import AdminSite
from django.contrib.admin.apps import AdminConfig

from geosight.tenants.utils import is_public_tenant


class TenantsAdminConfig(AdminConfig):
    """Admin config for tenants."""

    default_site = 'geosight.tenants.admin_apps.TenantsAdminSite'


class TenantsAdminSite(AdminSite):
    """Admin site for tenants."""

    def get_app_list(self, request):
        """Ger app list that can just be shown on main tenants."""
        app_list = super().get_app_list(request)

        # Check if it is main schema or not
        # Exclude the app needs to be
        if not is_public_tenant(request):
            # Filter out apps to hide
            app_list = [
                app for app in app_list if
                app['app_label'] not in settings.TENANTS_SECRET_APPS
            ]
        return app_list
