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
__date__ = '13/06/2023'
__copyright__ = ('Copyright 2023, Unicef')

import json
import os

from cloud_native_gis.models.layer import LayerType as CloudNativeLayerType
from django.conf import settings
from django.db.utils import ProgrammingError
from django.http import HttpResponseBadRequest
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from shapely.geometry import shape
from shapely.ops import unary_union
from shapely import simplify

from geosight.data.models.context_layer import ContextLayer, LayerType
from geosight.data.serializer.context_layer import ContextLayerSerializer
from geosight.data.utils import run_zonal_analysis_raster
from geosight.permission.access import (
    read_permission_resource,
    delete_permission_resource
)


class ContextLayerListAPI(APIView):
    """Return ContextLayer list."""

    def get(self, request):
        """Return ContextLayer list."""
        return Response(
            ContextLayerSerializer(
                ContextLayer.permissions.list(request.user).order_by('name'),
                many=True, context={'user': request.user}
            ).data
        )

    def delete(self, request):
        """Delete objects."""
        ids = json.loads(request.data['ids'])
        for obj in ContextLayer.permissions.delete(request.user).filter(
                id__in=ids):
            obj.delete()
        return Response('Deleted')


class ContextLayerDetailAPI(APIView):
    """API for detail of context layer."""

    permission_classes = (IsAuthenticated,)

    def get(self, request, pk):
        """Delete an indicator."""
        layer = get_object_or_404(ContextLayer, pk=pk)
        read_permission_resource(layer, request.user)
        return Response(
            ContextLayerSerializer(
                layer,
                context={'user': request.user}
            ).data
        )

    def delete(self, request, pk):
        """Delete an basemap."""
        layer = get_object_or_404(ContextLayer, pk=pk)
        delete_permission_resource(layer, request.user)
        layer.delete()
        return Response('Deleted')


class ContextLayerZonalAnalysisAPI(APIView):
    """API for zonal analysis for context layer."""

    permission_classes = (IsAuthenticated,)

    def post(self, request, pk, aggregation='sum'):
        """Run zonal analysis."""
        try:
            geometry_datas = json.loads(request.data.get('geometries'))
        except TypeError:
            return HttpResponseBadRequest(
                'geometries is empty or not valid JSON'
            )

        layer: ContextLayer = get_object_or_404(ContextLayer, pk=pk)
        geometries = [shape(geometry_data) for geometry_data in geometry_datas]
        geometries_combined = unary_union(geometries)
        geometries_simplified = simplify(geometries_combined, tolerance=0.01)

        if layer.layer_type in [LayerType.RASTER_TILE, LayerType.RASTER_COG]:
            bbox = geometries_combined.bounds
            layer_path = layer.download_layer(original_name=True, bbox=bbox)
            result = run_zonal_analysis_raster(
                layer_path,
                [geometries_simplified],
                aggregation
            )
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
                cloud_layer = get_object_or_404(
                    Layer, pk=layer.cloud_native_gis_layer_id
                )
                if cloud_layer.layer_type == CloudNativeLayerType.VECTOR_TILE:
                    try:
                        result = run_zonal_analysis_vector_layer(
                            geometry=geometries_simplified,
                            layer=cloud_layer,
                            aggregation=aggregation,
                            aggregation_field=request.data[
                                'aggregation_field'
                            ],
                        )
                        return Response(result)
                    except KeyError as e:
                        return HttpResponseBadRequest(
                            f'{e} is required in payload'
                        )
                    except (ProgrammingError, ValueError) as e:
                        return HttpResponseBadRequest(f'{e}')

        return HttpResponseBadRequest('Unsupported layer type')
