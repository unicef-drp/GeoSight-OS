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
__date__ = '22/08/2023'
__copyright__ = ('Copyright 2023, Unicef')

from django.conf import settings
from django.db import connections


def create_temp_schema():
    """Creating temp schema for temporary database."""
    try:
        with connections['temp'].cursor() as cursor:
            cursor.execute(
                f'CREATE SCHEMA IF NOT EXISTS {settings.TEMP_SCHEMA_NAME}'
            )
    except Exception:
        pass
