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

from django.http import Http404, HttpResponse
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView

from geosight.georepo.serializer.entity import EntityCentroidSerializer
from geosight.permission.access import read_data_permission_resource
from geosight.reference_dataset.models import ReferenceDataset
from geosight.reference_dataset.serializer.reference_dataset import (
    ReferenceDatasetCentroidUrlSerializer
)
from geosight.reference_dataset.utils.vector_tile import querying_vector_tile


class ReferenceDatasetCentroid(APIView):
    """Return ReferenceDataset centroid data."""

    def get(self, request, identifier, level):
        """Return BasemapLayer list."""
        view = get_object_or_404(
            ReferenceDataset,
            identifier=identifier
        )
        read_data_permission_resource(view, request.user)
        entities = view.entities_set.filter(admin_level=level)
        return Response(
            EntityCentroidSerializer(entities, many=True).data
        )


class ReferenceDatasetCentroidUrls(APIView):
    """Return ReferenceDataset centroid data."""

    def get(self, request, identifier):
        """Return BasemapLayer list."""
        view = get_object_or_404(
            ReferenceDataset,
            identifier=identifier
        )
        read_data_permission_resource(view, request.user)
        return Response(
            ReferenceDatasetCentroidUrlSerializer(view.levels, many=True).data
        )


class ReferenceDatasetVectorTile(APIView):
    """Return ReferenceDataset vector tile data."""

    def get(self, request, identifier, z, x, y):
        """Return BasemapLayer list."""
        view = get_object_or_404(
            ReferenceDataset,
            identifier=identifier
        )
        read_data_permission_resource(view, request.user)
        tiles = querying_vector_tile(view, z=z, x=x, y=y)

        # If no tile 404
        if not len(tiles):
            raise Http404()
        return HttpResponse(tiles, content_type="application/x-protobuf")
