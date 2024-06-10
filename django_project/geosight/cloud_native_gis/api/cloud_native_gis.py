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
__date__ = '06/06/2024'
__copyright__ = ('Copyright 2023, Unicef')

from cloud_native_gis.api.vector_tile import VectorTileLayer
from rest_framework.response import Response
from rest_framework.views import APIView

from geosight.cloud_native_gis.models import (
    CloudNativeGISLayer
)
from geosight.cloud_native_gis.serializer import (
    CloudNativeGISLayerSerializer
)


class CloudNativeGISLayerListAPI(APIView):
    """Return CloudNativeGISLayer list."""

    def get(self, request):
        """Return BasemapLayer list."""
        return Response(
            CloudNativeGISLayerSerializer(
                CloudNativeGISLayer.permissions.list(
                    request.user
                ).order_by('name'),
                many=True, context={'user': request.user, 'request': request}
            ).data
        )


class CloudNativeGISLayerVectorTile(VectorTileLayer):
    """Return Layer in vector tile protobuf."""

    pass
