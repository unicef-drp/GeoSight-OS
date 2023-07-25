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

from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from geosight.data.models.basemap_layer import BasemapLayer
from geosight.data.serializer.basemap_layer import BasemapLayerSerializer
from geosight.permission.access import delete_permission_resource


class BasemapListAPI(APIView):
    """Return BasemapLayer list."""

    def get(self, request):
        """Return BasemapLayer list."""
        return Response(
            BasemapLayerSerializer(
                BasemapLayer.permissions.list(request.user).order_by('name'),
                many=True, context={'user': request.user}
            ).data
        )

    def delete(self, request):
        """Delete an basemap."""
        ids = json.loads(request.data['ids'])
        for obj in BasemapLayer.permissions.delete(request.user).filter(
                id__in=ids):
            obj.delete()
        return Response('Deleted')


class BasemapDetailAPI(APIView):
    """API for detail of basemap."""

    permission_classes = (IsAuthenticated,)

    def delete(self, request, pk):
        """Delete an basemap."""
        basemap = get_object_or_404(BasemapLayer, pk=pk)
        delete_permission_resource(basemap, request.user)
        basemap.delete()
        return Response('Deleted')
