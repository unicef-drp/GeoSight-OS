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

from .cloud_native_gis import *
from .contrib import *
from .django import *
from .machine_info_fetcher import *
from .project import *
from .reference_dataset import *
from .tenants import *

# --------------------------------------
# FEATURE: SSL
# --------------------------------------
try:
    import sslserver  # noqa:F401

    CONTRIB_APPS = CONTRIB_APPS + [
        'sslserver',
    ]
except ImportError:
    pass

SHARED_APPS = (
        TENANTS_APPS + DJANGO_APPS + CONTRIB_APPS + PROJECT_APPS +
        CLOUD_NATIVE_GIS_APPS + REFERENCE_DATASET_APPS +
        MACHINE_INFO_FETCHER_APPS
)
TENANT_APPS = (
        DJANGO_APPS_TENANT + CONTRIB_APPS_TENANT + TENANTS_CONTRIB_APPS +
        PROJECT_APPS + CLOUD_NATIVE_GIS_APPS + REFERENCE_DATASET_APPS
)

# Save it to installed apps
INSTALLED_APPS = SHARED_APPS + [
    app for app in TENANT_APPS if app not in SHARED_APPS
]

# Check plugins
PLUGINS = []
if CLOUD_NATIVE_GIS_ENABLED:
    PLUGINS.append(CLOUD_NATIVE_GIS_PLUGIN_NAME)
if TENANTS_ENABLED:
    PLUGINS.append(TENANTS_PLUGIN_NAME)
if REFERENCE_DATASET_ENABLED:
    PLUGINS.append(REFERENCE_DATASET_PLUGIN_NAME)
