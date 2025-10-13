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

from cloud_native_gis.models.layer import Layer
from django.db import connection


def delete_queryset(queryset):
    """
    Force delete all records in a queryset that may not have a primary key.

    This function bypasses the Django ORM's usual delete() method and
    directly executes a DELETE SQL statement. Useful for tables without
    a primary key.

    :param queryset: Django queryset to delete
    :type queryset: django.db.models.QuerySet
    :return: Number of rows deleted
    :rtype: int
    """
    query = queryset.query
    compiler = query.get_compiler(using=queryset.db)
    sql, params = compiler.as_sql()

    delete_sql = "DELETE FROM" + sql.split("FROM", 1)[1]

    with connection.cursor() as cursor:
        cursor.execute(delete_sql, params)

    return cursor.rowcount


def get_columns_with_types(layer: Layer):
    """Return metadata for all columns in a GIS layer table.

    Combines standard columns from information_schema with geometry columns
    from PostGIS's geometry_columns table.

    :param layer: Layer object containing schema and table name
    :type layer: cloud_native_gis.models.layer.Layer
    :return: List of dictionaries with column names and types
    :rtype: list of dict
    :example:

    >>> get_columns_with_types(layer)
    [
        {'name': 'id', 'type': 'integer'},
        {'name': 'name', 'type': 'text'},
        {'name': 'geom', 'type': 'point'}
    ]
    """
    schema_name = layer.schema_name
    table_name = layer.table_name
    with connection.cursor() as cursor:
        # Get standard columns
        cursor.execute(
            """
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_schema = %s
              AND table_name = %s
            """, [schema_name, table_name])
        normal_cols = [
            {'name': row[0], 'type': row[1].lower()} for row in
            cursor.fetchall()
        ]

        # Get geometry columns (PostGIS)
        cursor.execute(
            """
            SELECT f_geometry_column, type
            FROM geometry_columns
            WHERE f_table_schema = %s
              AND f_table_name = %s
            """, [schema_name, table_name])
        geom_cols = {row[0]: row[1].lower() for row in cursor.fetchall()}

    # Merge: replace type in normal_cols if it's a geometry
    for col in normal_cols:
        if col['name'] in geom_cols:
            col['type'] = geom_cols[col['name']]

    return normal_cols
