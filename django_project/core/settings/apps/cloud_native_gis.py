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

CLOUD_NATIVE_GIS_PLUGIN_NAME = 'cloud_native_gis'
CLOUD_NATIVE_GIS_APPS = []
CLOUD_NATIVE_GIS_ENABLED = False

# --------------------------------------
# FEATURE: CLOUD NATIVE GIS
# --------------------------------------
try:
    import cloud_native_gis  # noqa:F401
    CLOUD_NATIVE_GIS_ENABLED = CLOUD_NATIVE_GIS_PLUGIN_NAME in os.environ.get(
        'PLUGINS', ''
    )
except ImportError:
    pass
print(CLOUD_NATIVE_GIS_ENABLED)
if CLOUD_NATIVE_GIS_ENABLED:
    CLOUD_NATIVE_GIS_APPS = [
        'cloud_native_gis',
        'geosight.cloud_native_gis'
    ]
