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
from shapely.geometry import GeometryCollection


def run_zonal_analysis_vector_layer(
        layer: Layer,
        aggregation: str,
        aggregation_field: str,
        geometry: GeometryCollection
):
    """Run zonal analysis on multiple geometries."""
    if layer.layer_type != LayerType.VECTOR_TILE:
        raise ValueError(
            'run_zonal_analysis_vector_layer just for vector layer'
        )
    aggregation = aggregation.lower().strip()
    query = None
    if aggregation == 'count':
        query = f"""
            SELECT count(*) FROM {layer.schema_name}.{layer.table_name}
            WHERE ST_Intersects(
                geometry, ST_GeomFromText('{geometry.wkt}', 4326)
            )
        """
    elif aggregation in ['sum', 'max', 'min', 'avg']:
        query = f"""
            SELECT {aggregation}("{aggregation_field}")
            FROM {layer.schema_name}.{layer.table_name}
            WHERE ST_Intersects(
                geometry, ST_GeomFromText('{geometry.wkt}', 4326)
            )
        """
    if query:
        with connection.cursor() as cursor:
            cursor.execute(query)
            row = cursor.fetchone()
            return row[0]
    raise ValueError(
        'Aggregation must be one of the following: count'
    )
