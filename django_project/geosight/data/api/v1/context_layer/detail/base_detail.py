"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""
__author__ = 'Irwan Fathurrahman'
__date__ = '10/10/2025'
__copyright__ = ('Copyright 2025, Unicef')

from cloud_native_gis.models.layer import Layer
from django.http import HttpResponseBadRequest
from django.shortcuts import get_object_or_404
from drf_yasg.utils import swagger_auto_schema
from rest_framework import status
from rest_framework.response import Response

from geosight.data.api.v1.base import (
    BaseApiV1ResourceReadOnly
)
from geosight.data.models.context_layer import ContextLayer, LayerType
from geosight.permission.access import read_data_permission_resource


class ContextBaseDetailDataView(BaseApiV1ResourceReadOnly):
    """Context Layer base detail."""

    non_filtered_keys = ['page', 'page_size']

    def _get_object(self):
        """Retrieve the object based on the URL parameter ``context_layer_id``.

        :return: The requested ``ContextLayer`` instance.
        :rtype: geosight.data.models.context_layer.ContextLayer
        """
        obj_id = self.kwargs.get('context_layer_id')
        obj = get_object_or_404(
            ContextLayer.objects.filter(pk=obj_id)
        )
        return obj

    def get_context_layer_object(self):
        """Retrieve the linked cloud-native GIS for the current context layer.

        :return: The associated cloud-native GIS layer object.
        :rtype: cloud_native_gis.models.layer.Layer
        :raises ValueError:
            - If the context layer has no associated cloud-native layer.
            - If the layer type is invalid for this request.
        """
        obj = self._get_object()
        if obj.layer_type == LayerType.CLOUD_NATIVE_GIS_LAYER:
            if obj.cloud_native_gis_layer_id:
                return Layer.objects.get(id=obj.cloud_native_gis_layer_id)
            raise ValueError(
                "The context layer does not have a cloud native layer."
            )
        raise ValueError("Invalid layer type for this request.")

    def list(self, request, *args, **kwargs):  # noqa DOC110, DOC103
        """
        Retrieve a list of data for the specified context layer.

        This method handles ``GET`` requests to return a collection
        of context layer data, typically paginated. It validates
        the user's read permissions before proceeding.

        :param request: The HTTP request object.
        :type request: rest_framework.request.Request
        :param args: Additional positional arguments.
        :param kwargs: Additional keyword arguments.
        :return: A paginated response containing context layer data.
        :rtype: rest_framework.response.Response
        :raises HttpResponseBadRequest:
            If an invalid layer type or data access error occurs.
        """
        obj = self._get_object()
        read_data_permission_resource(obj, self.request.user)
        try:
            return super().list(request, *args, **kwargs)
        except ValueError as e:
            return HttpResponseBadRequest(f"{e}")

    @swagger_auto_schema(auto_schema=None)
    def retrieve(self, request, id=None):
        """
        Retrieve detailed information for a specific context layer object.

        This endpoint is disabled and always returns ``404 Not Found``.

        :param request: The HTTP request object.
        :type request: rest_framework.request.Request
        :param id: The object identifier (unused in this implementation).
        :type id: int or str, optional
        :return: A response indicating the resource was not found.
        :rtype: rest_framework.response.Response
        """
        return Response(
            {"detail": "Not found."},
            status=status.HTTP_404_NOT_FOUND
        )
