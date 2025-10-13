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
        """
        Retrieve the Context Layer object based on URL parameter 'id'.

        :return: The requested Indicator instance.
        :rtype: Indicator
        """
        obj_id = self.kwargs.get('context_layer_id')
        obj = get_object_or_404(
            ContextLayer.objects.filter(pk=obj_id)
        )
        return obj

    def get_context_layer_object(self):
        """Return context layer object.

        Example: cloud native
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
        Retrieve a list of data of context layer.
        Specifically for cloud native layer.

        This method handles GET requests to return a collection of indicator
        objects, typically paginated.

        :param request: The HTTP request object.
        :type request: rest_framework.request.Request
        :param args: Additional positional arguments.
        :param kwargs: Additional keyword arguments.
        :return: Response containing a list of indicator rows.
        :rtype: rest_framework.response.Response
        """
        obj = self._get_object()
        read_data_permission_resource(obj, self.request.user)
        try:
            return super().list(request, *args, **kwargs)
        except ValueError as e:
            return HttpResponseBadRequest(f"{e}")

    @swagger_auto_schema(auto_schema=None)
    def retrieve(self, request, id=None):
        """Return detailed of context layer."""
        return Response(
            {"detail": "Not found."},
            status=status.HTTP_404_NOT_FOUND
        )
