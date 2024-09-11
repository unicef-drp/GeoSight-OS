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
__date__ = '02/10/2024'
__copyright__ = ('Copyright 2023, Unicef')

from django.db import connection

from core.utils import child_classes


class MaterializeViewModel:
    """Materialized view model."""

    @classmethod
    def refresh_materialized_views(cls):
        """Refresh materialized views."""
        with connection.cursor() as cursor:
            query = f'REFRESH MATERIALIZED VIEW {cls._meta.db_table}'
            cursor.execute(query)

    @staticmethod
    def child_classes():
        """Return child classes."""
        return child_classes(MaterializeViewModel)
