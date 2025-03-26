# coding=utf-8
"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""
__author__ = 'zakki@kartoza.com'
__date__ = '13/02/2025'
__copyright__ = ('Copyright 2025, Unicef')

import json
import os

from django.conf import settings
from django.db.utils import ProgrammingError
from rest_framework.response import Response
from shapely import simplify
from shapely.geometry import shape
from shapely.ops import unary_union

from core.celery import app
from core.utils import decompress_text
from geosight.data.models.context_layer import (
    ContextLayer,
    LayerType,
    ZonalAnalysis
)
from geosight.data.utils import run_zonal_analysis_raster


@app.task
def run_zonal_analysis(zonal_analysis_uuid):
    """Run zonal analysis task."""
    zonal_analysis: ZonalAnalysis = ZonalAnalysis.objects.get(
        uuid=zonal_analysis_uuid
    )
    zonal_analysis.running()

    layer: ContextLayer = zonal_analysis.context_layer
    aggregation = zonal_analysis.aggregation

    geometry_datas = json.loads(
        decompress_text(
            zonal_analysis.geom_compressed
        )
    )
    geometries = [shape(geometry_data) for geometry_data in geometry_datas]
    geometries_combined = unary_union(geometries)
    geometries_simplified = simplify(geometries_combined, tolerance=0.01)

    # For raster
    if layer.layer_type in [LayerType.RASTER_TILE, LayerType.RASTER_COG]:
        bbox = geometries_combined.bounds
        layer_path = layer.download_layer(original_name=True, bbox=bbox)
        result = run_zonal_analysis_raster(
            layer_path,
            [geometries_simplified],
            aggregation
        )
        zonal_analysis.success(result)
        if layer.layer_type == LayerType.RASTER_TILE:
            os.remove(layer_path)
        return Response(result)

    # For cloud native GIS
    elif layer.layer_type == LayerType.CLOUD_NATIVE_GIS_LAYER:
        if settings.CLOUD_NATIVE_GIS_ENABLED:
            from geosight.cloud_native_gis.utils import (
                run_zonal_analysis_vector_layer
            )
            from cloud_native_gis.models.layer import Layer

            try:
                cloud_layer = Layer.objects.get(
                    id=layer.cloud_native_gis_layer_id
                )
            except Layer.DoesNotExist:
                zonal_analysis.failed(
                    'Could not find Cloud Native GIS Layer with id {}'.format(
                        layer.cloud_native_gis_layer_id
                    )
                )
                return

            if cloud_layer.layer_type == 'Vector Tile':
                try:
                    result = run_zonal_analysis_vector_layer(
                        geometry=geometries_simplified,
                        layer=cloud_layer,
                        aggregation=aggregation,
                        aggregation_field=zonal_analysis.aggregation_field,
                    )
                    zonal_analysis.success(float(result))
                except KeyError as e:
                    zonal_analysis.failed(
                        f'{e} is required in payload'
                    )
                except (ProgrammingError, ValueError) as e:
                    zonal_analysis.failed(
                        f'{e}'
                    )
