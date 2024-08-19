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

SHARED_APPS = (
    'django_tenants',
    'tenants',

    'patch',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.redirects',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.sitemaps',
    'django.contrib.staticfiles',
    'django.contrib.gis',
    'django.contrib.messages',

    'rest_framework',
    'rest_framework_gis',
    'webpack_loader',
    'django_celery_beat',
    'django_celery_results',
    'django_tenants_celery_beat',
    'captcha',
    'knox',
    'drf_yasg',
    'tinymce',
    'cloud_native_gis',

    # Project specified
    'azure_auth',
    'core',
    'docs',
    'geosight.data',
    'geosight.georepo',
    'geosight.permission',
    'geosight.importer',
    'geosight.cloud_native_gis',
    'frontend',
)

TENANT_APPS = (
    'rest_framework',
    'rest_framework_gis',
    'django.contrib.admin',
    'django.contrib.auth',
    'knox',
    'cloud_native_gis',

    # Project specified
    'azure_auth',
    'core',
    'docs',
    'geosight.data',
    'geosight.georepo',
    'geosight.permission',
    'geosight.importer',
    'geosight.cloud_native_gis',
    'frontend',
)

try:
    # use ssl
    import sslserver  # noqa:F401

    SHARED_APPS = SHARED_APPS + (
        'sslserver',
    )
except ImportError:
    pass

INSTALLED_APPS = list(SHARED_APPS) + [
    app for app in TENANT_APPS if app not in SHARED_APPS
]
