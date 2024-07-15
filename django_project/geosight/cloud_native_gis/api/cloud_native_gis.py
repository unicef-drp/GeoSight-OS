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
from cloud_native_gis.models.layer_upload import LayerUpload
from django.core.files.storage import FileSystemStorage
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView

from geosight.cloud_native_gis.models import CloudNativeGISLayer
from geosight.cloud_native_gis.serializer import LayerUploadSerializer
from geosight.permission.access import (
    edit_permission_resource
)


class CloudNativeGISLayerImporterFileView(APIView):
    """Import file for importer."""

    parser_classes = (CloudNativeGISLayer,)

    def post(self, request, pk):
        """Post file."""
        layer = get_object_or_404(CloudNativeGISLayer, id=pk)
        edit_permission_resource(layer, request.user)

        instance = LayerUpload(
            created_by=request.user, layer=layer
        )
        instance.emptying_folder()

        # Save files
        file = request.FILES['file']
        FileSystemStorage(
            location=instance.folder
        ).save(file.name, file)
        instance.save()
        return Response('Uploaded')


class CloudNativeGISLayerLastImporter(APIView):
    """Last importer."""

    def get(self, request, pk):
        """Post file."""
        layer = get_object_or_404(CloudNativeGISLayer, id=pk)
        edit_permission_resource(layer, request.user)
        return Response(
            LayerUploadSerializer(
                layer.layerupload_set.all().order_by('pk').last()
            ).data
        )


class CloudNativeGISLayerVectorTile(VectorTileLayer):
    """Return Layer in vector tile protobuf."""

    pass
