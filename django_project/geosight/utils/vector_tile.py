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
__date__ = '14/02/2024'
__copyright__ = ('Copyright 2023, Unicef')

from django.db import connection

from geosight.georepo.models.reference_layer import ReferenceLayerView


def querying_vector_tile(view: ReferenceLayerView, z: int, x: int, y: int):
    """Return vector tile for all entities of view."""
    sql = f"""
        WITH mvtgeom AS
        (
            SELECT name, name as label, geom_id as ucode,
            concept_uuid, admin_level as level,
                ST_AsMVTGeom(
                    ST_Transform(geometry, 3857),
                    ST_TileEnvelope({z}, {x}, {y}),
                    extent => 4096, buffer => 64
                ) as geom
                FROM geosight_georepo_entity AS feature
                WHERE reference_layer_id={view.id}
        ),
        tiles as (
           SELECT
             ST_AsMVT(
             mvtgeom.*,
             'Level-' || level
           ) AS mvt
           FROM mvtgeom
           GROUP BY level
        )
        SELECT string_agg(mvt, '') from tiles;
    """

    tiles = []
    # Raw query it
    with connection.cursor() as cursor:
        cursor.execute(sql)
        rows = cursor.fetchall()
        for row in rows:
            tiles.append(bytes(row[0]))

    return tiles
