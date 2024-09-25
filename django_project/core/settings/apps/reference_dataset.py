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
__date__ = '25/09/2024'
__copyright__ = ('Copyright 2023, Unicef')

import os

REFERENCE_DATASET_PLUGIN_NAME = 'reference_dataset'
REFERENCE_DATASET_APPS = []
REFERENCE_DATASET_ENABLED = False

# --------------------------------------
# FEATURE: REFERENCE DATASET
# --------------------------------------
try:
    import fiona  # noqa:F401

    REFERENCE_DATASET_ENABLED = (
            REFERENCE_DATASET_PLUGIN_NAME
            in os.environ.get('PLUGINS', '')
    )
except ImportError:
    pass

if REFERENCE_DATASET_ENABLED:
    REFERENCE_DATASET_APPS = [
        'geosight.reference_dataset',
    ]
