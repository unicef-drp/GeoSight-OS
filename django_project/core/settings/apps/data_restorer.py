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
__date__ = '02/04/2026'
__copyright__ = ('Copyright 2026, Unicef')

import os

DATA_RESTORER_PLUGIN_NAME = 'data_restorer'
DATA_RESTORER_APPS = []
DATA_RESTORER_ENABLED = False

# --------------------------------------
# FEATURE: DATA_RESTORER
# --------------------------------------
try:
    DATA_RESTORER_ENABLED = (
            DATA_RESTORER_PLUGIN_NAME in os.environ.get('PLUGINS', '')
    )
except ImportError:
    pass

if DATA_RESTORER_ENABLED:
    DATA_RESTORER_APPS = [
        'geosight.data_restorer'
    ]
