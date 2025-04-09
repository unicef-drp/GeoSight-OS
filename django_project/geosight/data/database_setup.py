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

from django.db import connection


def create_pg_trgm_extension():
    """Create pg_trgm extension."""
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                'CREATE EXTENSION IF NOT EXISTS pg_trgm'
            )
        print('CREATE EXTENSION')
    except Exception:
        pass
