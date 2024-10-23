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
__date__ = '22/10/2024'
__copyright__ = ('Copyright 2023, Unicef')

import os

MACHINE_INFO_FETCHER_PLUGIN_NAME = 'machine_info_fetcher'
MACHINE_INFO_FETCHER_APPS = []
MACHINE_INFO_FETCHER_ENABLED = False

# --------------------------------------
# FEATURE: MACHINE INFO FETCHER
# --------------------------------------
try:
    import uwsgi_tools  # noqa:F401

    MACHINE_INFO_FETCHER_ENABLED = (
            MACHINE_INFO_FETCHER_PLUGIN_NAME in os.environ.get('PLUGINS', '')
    )
except ImportError:
    pass

if MACHINE_INFO_FETCHER_ENABLED:
    MACHINE_INFO_FETCHER_APPS = [
        'geosight.machine_info_fetcher'
    ]
