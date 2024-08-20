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
__date__ = '20/08/2024'
__copyright__ = ('Copyright 2023, Unicef')

TENANTS_APPS = []
TENANTS_CONTRIB_APPS = []

TENANTS_ENABLED = False
# --------------------------------------
# FEATURE: TENANTS
# --------------------------------------
try:
    import django_tenants  # noqa:F401
    import django_tenants_celery_beat  # noqa:F401

    TENANTS_APPS = [
        'django_tenants',
        'geosight.tenants',
    ]

    TENANTS_CONTRIB_APPS = [
        'django_tenants_celery_beat'
    ]
    TENANTS_ENABLED = True

    # FEATURE: Multi tenant
    TENANT_MODEL = "geosight_tenants.Client"
    TENANT_DOMAIN_MODEL = "geosight_tenants.Domain"
    PERIODIC_TASK_TENANT_LINK_MODEL = "geosight_tenants.PeriodicTaskTenantLink"
    DEFAULT_FILE_STORAGE = "django_tenants.files.storage.TenantFileSystemStorage"
    MULTITENANT_RELATIVE_MEDIA_ROOT = ""
except ImportError:
    pass
