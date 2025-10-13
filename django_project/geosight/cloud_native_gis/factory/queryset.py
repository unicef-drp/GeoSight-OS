"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""
__author__ = 'Irwan Fathurrahman'
__date__ = '10/10/2025'
__copyright__ = ('Copyright 2025, Unicef')

from django.db import connection


def delete_queryset(queryset):
    """Force delete for queryset without primary key."""
    query = queryset.query
    compiler = query.get_compiler(using=queryset.db)
    sql, params = compiler.as_sql()

    delete_sql = "DELETE FROM" + sql.split("FROM", 1)[1]

    with connection.cursor() as cursor:
        cursor.execute(delete_sql, params)

    return cursor.rowcount
