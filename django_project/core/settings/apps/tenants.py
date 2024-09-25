# coding=utf-8
"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

THIS IS PLUGIN.
"""
__author__ = 'irwan@kartoza.com'
__date__ = '20/08/2024'
__copyright__ = ('Copyright 2023, Unicef')

import os

TENANTS_PLUGIN_NAME = 'tenants'
TENANTS_APPS = []
TENANTS_CONTRIB_APPS = []
TENANTS_ENABLED = False
# --------------------------------------
# FEATURE: TENANTS
# --------------------------------------
try:
    import django_tenants  # noqa:F401
    import django_tenants_celery_beat  # noqa:F401

    TENANTS_ENABLED = TENANTS_PLUGIN_NAME in os.environ.get('PLUGINS', '')
except ImportError:
    pass

if TENANTS_ENABLED:
    TENANTS_APPS = [
        'django_tenants',
        'geosight.tenants',
        'geosight.tenants.admin_apps.TenantsAdminConfig'
    ]

    TENANTS_CONTRIB_APPS = [
        'django_tenants_celery_beat'
    ]

    # APPS that can't be shown on child tenant
    TENANTS_SECRET_APPS = [
        'geosight_tenants'
    ]

    # FEATURE: Multi tenant
    TENANT_MODEL = "geosight_tenants.Tenant"
    TENANT_DOMAIN_MODEL = "geosight_tenants.Domain"
    PERIODIC_TASK_TENANT_LINK_MODEL = "geosight_tenants.PeriodicTaskTenantLink"
    DEFAULT_FILE_STORAGE = (
        "django_tenants.files.storage.TenantFileSystemStorage"
    )
    MULTITENANT_RELATIVE_MEDIA_ROOT = "%s"
