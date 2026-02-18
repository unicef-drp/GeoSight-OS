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

import uuid

from cloud_native_gis.api.layer_download import DownloadFileAPI
from cloud_native_gis.api.vector_tile import VectorTileLayer
from cloud_native_gis.models.layer import Layer, LayerType
from cloud_native_gis.models.layer_upload import LayerUpload
from django.core.files.storage import FileSystemStorage
from knox.auth import TokenAuthentication
from rest_framework.authentication import (
    SessionAuthentication, BasicAuthentication
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.auth import BearerAuthentication
from core.permissions import (
    RoleContributorAuthenticationPermission
)


class CloudNativeGISLayerVectorTile(VectorTileLayer):
    """Return Layer in vector tile protobuf."""

    pass


class CloudNativeGISLayerUploadCreate(APIView):
    """API for uploading Cloud Native GIS."""

    parser_classes = (Layer,)

    permission_classes = (
        IsAuthenticated, RoleContributorAuthenticationPermission
    )

    def post(self, request):
        """
        Upload a file and create a new Cloud Native GIS layer.

        :param request: The HTTP request containing the uploaded file.
        :type request: rest_framework.request.Request
        :return: The ID of the newly created layer.
        :rtype: rest_framework.response.Response
        """
        unique_id = uuid.uuid4()
        layer = Layer.objects.create(
            unique_id=unique_id,
            layer_type=LayerType.VECTOR_TILE,
            created_by=request.user,
            name=unique_id
        )
        instance = LayerUpload(
            created_by=request.user, layer=layer
        )
        instance.emptying_folder()

        # Save files
        file = request.FILES['file']
        FileSystemStorage(location=instance.folder).save(file.name, file)
        instance.save()
        return Response(layer.id)


class CloudNativeGISDownloadFileAPI(DownloadFileAPI):
    """Override DownloadFileAPI to use CloudNativeGISLayerVectorTile."""

    authentication_classes = [
        SessionAuthentication, BasicAuthentication,
        TokenAuthentication, BearerAuthentication
    ]
