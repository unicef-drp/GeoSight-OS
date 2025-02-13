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

import uuid
import json

from django.http import HttpResponseBadRequest
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.utils import compress_text
from geosight.data.models.context_layer import ContextLayer, ZonalAnalysis
from geosight.data.serializer.context_layer import ContextLayerSerializer
from geosight.data.tasks.zonal_analysis import run_zonal_analysis
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

        layer = get_object_or_404(ContextLayer, pk=pk)
        aggregation_field = request.data.get('aggregation_field', None)

        zonal_analysis = ZonalAnalysis.objects.create(
            uuid=uuid.uuid4(),
            context_layer=layer,
            aggregation=aggregation,
            aggregation_field=aggregation_field,
            geom_compressed=compress_text(json.dumps(geometry_datas)),
        )
        run_zonal_analysis.delay(zonal_analysis.uuid)

        return Response({'uuid': zonal_analysis.uuid.hex})


class ZonalAnalysisResultAPI(APIView):
    """Fetch Zonal Analysis results."""

    def get(self, request, analysis_uuid):
        """Get zonal analysis result."""
        analysis: ZonalAnalysis = get_object_or_404(
            ZonalAnalysis,
            uuid=analysis_uuid
        )
        response = {
            'status': analysis.status,
            'result': analysis.result,
        }

        # if analysis has finished, delete it.
        if analysis.status in [
            ZonalAnalysis.AnalysisStatus.SUCCESS,
            ZonalAnalysis.AnalysisStatus.FAILED
        ]:
            analysis.delete()
        return Response(response)
