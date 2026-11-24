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
__date__ = '06/01/2025'
__copyright__ = ('Copyright 2023, Unicef')

from cloud_native_gis.models import Layer, LayerType

from django.db import connection
from psycopg2 import sql
from shapely.geometry import GeometryCollection


def run_zonal_analysis_vector_layer(
        layer: Layer,
        aggregation: str,
        aggregation_field: str,
        geometry: GeometryCollection
):
    """
    Run zonal analysis of a vector layer on the geometry.

    :param layer: The cloud native gis layer.
    :type layer: cloud_native_gis.models.Layer
    :param aggregation: The aggregation method: count, sum, max, min, avg.
    :type aggregation: str
    :param aggregation_field:
        The column of the layer to be aggregated.
        It must be an existing column of the layer table.
    :type aggregation_field: str
    :param geometry: The geometry to intersect with the layer.
    :type geometry: shapely.geometry.GeometryCollection
    :return: The aggregated value.
    :rtype: float or int or None
    :raises ValueError:
        If the layer is not a vector layer, the aggregation is not
        recognized or the aggregation_field is not found in the layer.
    """
    if layer.layer_type != LayerType.VECTOR_TILE:
        raise ValueError(
            'run_zonal_analysis_vector_layer just for vector layer'
        )
    aggregation = aggregation.lower().strip()
    if aggregation == 'count':
        select = sql.SQL('count(*)')
    elif aggregation in ['sum', 'max', 'min', 'avg']:
        if aggregation_field not in layer_columns(layer):
            raise ValueError(
                f'aggregation_field {aggregation_field} is not found '
                f'in the layer.'
            )
        select = sql.SQL('{}({})').format(
            sql.SQL(aggregation), sql.Identifier(aggregation_field)
        )
    else:
        raise ValueError(
            'Aggregation must be one of the following: '
            'count, sum, max, min, avg'
        )
    query = sql.SQL(
        'SELECT {select} FROM {table} '
        'WHERE ST_Intersects(geometry, ST_GeomFromText(%s, 4326))'
    ).format(
        select=select,
        table=sql.Identifier(layer.schema_name, layer.table_name)
    )
    with connection.cursor() as cursor:
        cursor.execute(query.as_string(cursor.cursor), [geometry.wkt])
        row = cursor.fetchone()
        return row[0]


def layer_columns(layer: Layer):
    """
    Return column names of the table of a cloud native gis layer.

    :param layer: The cloud native gis layer.
    :type layer: cloud_native_gis.models.Layer
    :return: List of column names.
    :rtype: list[str]
    """
    with connection.cursor() as cursor:
        cursor.execute(
            'SELECT column_name FROM information_schema.columns '
            'WHERE table_schema = %s AND table_name = %s',
            [layer.schema_name, layer.table_name]
        )
        return [row[0] for row in cursor.fetchall()]
