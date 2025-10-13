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

from django.core.exceptions import FieldDoesNotExist
from django.http import HttpResponse, HttpResponseBadRequest
from drf_yasg.utils import swagger_auto_schema
from rest_framework import status
from rest_framework.decorators import action

from core.api_utils import common_api_params, ApiTag
from geosight.cloud_native_gis.factory.model import model_factory
from geosight.cloud_native_gis.factory.queryset import delete_queryset
from geosight.cloud_native_gis.factory.serializer import serializer_factory
from geosight.data.api.v1.context_layer.detail.base_detail import (
    ContextBaseDetailDataView
)
from geosight.data.models import LayerType
from geosight.permission.access import edit_data_permission_resource


class ContextLayerDataViewSet(ContextBaseDetailDataView):
    """Context Layer Data ViewSet."""

    non_filtered_keys = ['page', 'page_size']

    def get_serializer_class(self):
        """
        Return a serializer class for the current queryset model.

        This dynamically creates a serializer based on the model
        generated from the factory.

        :return: Serializer class for the queryset model.
        :rtype: rest_framework.serializers.ModelSerializer
        """
        return serializer_factory(self.get_queryset().model)

    @property
    def queryset(self):
        """
        Return the filtered queryset for the API view.

        This method retrieves the base queryset and filters it
        according to the current context layer's ID. Only
        cloud-native GIS layers are supported.

        :return: Queryset filtered by context layer ID.
        :rtype: django.db.models.QuerySet
        :raises ValueError: If the layer type is not supported.
        """
        obj = self._get_object()
        if obj.layer_type == LayerType.CLOUD_NATIVE_GIS_LAYER:
            Model = model_factory(self.get_context_layer_object())
            return Model.objects.all()
        raise ValueError(
            "Currently, "
            "only cloud-native layers are supported for this endpoint. "
            "Please contact support for more information."
        )

    @swagger_auto_schema(
        method='get',
        operation_id='context-layer-features-list',
        tags=[ApiTag.CONTEXT_LAYER],
        manual_parameters=[
            *common_api_params
        ],
        operation_description=(
                'Retrieve features of accessed context layer for the user.'
                'Specifically for cloud native layer.'
        )
    )
    @swagger_auto_schema(
        method='delete',
        operation_id='context-layer-features-delete',
        tags=[ApiTag.CONTEXT_LAYER],
        manual_parameters=[
            *common_api_params
        ],
        operation_description=(
                'Remove filtered features '
                'of accessed context layer for the user.'
        )
    )
    @action(detail=False, methods=['get', 'delete', 'put'])
    def features(self, request, *args, **kwargs):  # noqa DOC110, DOC103
        """
        Retrieve a paginated list of data for the specified context layer.

        This method handles ``GET`` requests and returns the collection
        of objects (features) belonging to a specific cloud-native
        context layer.

        :param request: The HTTP request object.
        :type request: rest_framework.request.Request
        :param args: Additional positional arguments.
        :param kwargs: Additional keyword arguments.
        :return: Paginated list of context layer data.
        :rtype: rest_framework.response.Response
        """
        if request.method == 'DELETE':
            obj = self._get_object()
            edit_data_permission_resource(obj, self.request.user)

            query = self.get_queryset()
            count = query.count()
            if count > 1:
                return HttpResponseBadRequest(
                    f"Found {count} feature(s); "
                    "cannot delete more than one at a time."
                )
            delete_queryset(queryset=query)

            return HttpResponse(
                {"detail": f"{count} data deleted successfully."},
                status=status.HTTP_204_NO_CONTENT
            )
        if request.method == 'PUT':
            obj = self._get_object()
            edit_data_permission_resource(obj, self.request.user)

            query = self.get_queryset()
            count = query.count()
            if count > 1:
                return HttpResponseBadRequest(
                    f"Found {count} feature(s); "
                    "cannot update more than one at a time."
                )
            try:
                query.update(**request.data)
            except FieldDoesNotExist as e:
                return HttpResponseBadRequest(
                    f"Field does not exist:"
                    f"{getattr(e, 'name', str(e)).split('named')[1]}"
                )

            return HttpResponse(
                {"detail": f"{count} data deleted successfully."},
                status=status.HTTP_204_NO_CONTENT
            )
        return super().list(request, *args, **kwargs)

    @swagger_auto_schema(auto_schema=None)
    def list(self, request, id=None):
        """
        Retrieve detailed data for a specific context layer object.

        :param request: The HTTP request object.
        :type request: rest_framework.request.Request
        :param id: Identifier of the context layer object.
        :type id: int or str
        :return: Detailed data of the context layer object.
        :rtype: rest_framework.response.Response
        """
        return super().retrieve(request, id)

    @swagger_auto_schema(auto_schema=None)
    def retrieve(self, request, *args, **kwargs):  # noqa DOC110, DOC103
        """
        Retrieve detailed data for a specific context layer object.

        :param request: The HTTP request object.
        :type request: rest_framework.request.Request
        :param id: Identifier of the context layer object.
        :type id: int or str
        :return: Detailed data of the context layer object.
        :rtype: rest_framework.response.Response
        """
        return super().retrieve(request, *args, **kwargs)
