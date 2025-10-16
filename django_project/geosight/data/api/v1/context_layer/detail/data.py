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
from cloud_native_gis.utils.connection import fields
from cloud_native_gis.utils.geopandas import geojson_to_geopanda, Mode
from django.core.exceptions import FieldDoesNotExist
from django.http import HttpResponse, HttpResponseBadRequest
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from psycopg2.errors import UndefinedColumn, InvalidParameterValue
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

request_body = openapi.Schema(
    description='Geojson data.',
    type=openapi.TYPE_OBJECT,
    example={
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {
                    "id": 1,
                    "name": "New data",
                    "category": "Category 1"
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [0, 0]
                }
            }
        ]
    }
)


class ContextLayerDataViewSet(ContextBaseDetailDataView):
    """Context Layer Data ViewSet."""

    non_filtered_keys = ['page', 'page_size', 'fields', 'sort']

    def get_serializer_class(self):
        """
        Return a serializer class for the current queryset model.

        This dynamically creates a serializer based on the model
        generated from the factory.

        :return: Serializer class for the queryset model.
        :rtype: rest_framework.serializers.ModelSerializer
        """
        return serializer_factory(self.get_queryset().model)

    def update_data(self, replace=False):
        """
        Update data for the current context layer.

        This method updates the data for the layer associated with
        the current object context.
        The data should be provided in GeoJSON format. Depending
        on the `replace` flag,
        the data can either replace the existing data or be appended.

        :param replace:
            If True, existing layer data will be replaced;
            if False, new data will be appended.
        :type replace: bool
        :returns: HttpResponse indicating the result of the operation.
        :rtype: django.http.HttpResponse

        :note:
            Only layers of type
            `LayerType.CLOUD_NATIVE_GIS_LAYER` are supported.
        """
        obj = self._get_object()
        edit_data_permission_resource(obj, self.request.user)
        try:
            layer = self.get_context_layer_object(autocreate=replace)
            if obj.layer_type == LayerType.CLOUD_NATIVE_GIS_LAYER:
                try:
                    geojson_to_geopanda(
                        self.request.data, layer.schema_name, layer.table_name,
                        mode=Mode.REPLACE if replace else Mode.APPEND,
                    )
                except KeyError:
                    return HttpResponseBadRequest(
                        "Invalid payload format. "
                        "Format should be geojson format. "
                    )
                except UndefinedColumn as e:
                    error = f"{e}".split(" of relation")[0]
                    return HttpResponseBadRequest(
                        f"{error} does not exist"
                    )
                except InvalidParameterValue as e:
                    return HttpResponseBadRequest(f"{e}".split("\n")[0])
                except Exception as e:
                    return HttpResponseBadRequest(f"{e}")
                return HttpResponse(
                    {"detail": "Data created successfully."},
                    status=status.HTTP_204_NO_CONTENT
                )
            else:
                pass
        except ValueError:
            pass
        return HttpResponseBadRequest(
            "Invalid layer type for this request."
        )

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
        method='post',
        operation_id='context-layer-features-post',
        tags=[ApiTag.CONTEXT_LAYER],
        manual_parameters=[],
        request_body=request_body,
        operation_description=(
                'Add new feature(s) '
                'for the accessed context layer for the user.\n'
                'Need to be at least edit data permission.\n\n'
                'Payload is geojson format. '
                'The geometry type should be the same with the current data.\n'
        )
    )
    @swagger_auto_schema(
        method='patch',
        operation_id='context-layer-features-put',
        tags=[ApiTag.CONTEXT_LAYER],
        manual_parameters=[],
        operation_description=(
                'Update filtered feature of '
                'the accessed context layer for the user. '
                'Restricted to updating only one feature at a time. \n'
                'Need to be at least edit data permission.\n\n'
                'Payload is in json with field names as keys and value '
                'as the new value. \n'
                'e.g. {"field_1": "new_value", "field_2": "new_value}.'
        )
    )
    @swagger_auto_schema(
        method='delete',
        operation_id='context-layer-features-delete',
        tags=[ApiTag.CONTEXT_LAYER],
        manual_parameters=[],
        operation_description=(
                'Remove filtered feature of '
                'the accessed context layer for the user. '
                'Restricted to deleting only one feature at a time.\n'
                'Need to be at least edit data permission.'
        )
    )
    @action(detail=False, methods=['get', 'post', 'delete', 'patch'])
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
        if request.method == 'POST':
            return self.update_data(replace=False)
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
        if request.method == 'PATCH':
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
                {"detail": f"{count} data updated successfully."},
                status=status.HTTP_204_NO_CONTENT
            )
        return super().list(request, *args, **kwargs)

    @swagger_auto_schema(
        method='post',
        operation_id='context-layer-features-replace',
        tags=[ApiTag.CONTEXT_LAYER],
        manual_parameters=[],
        request_body=request_body,
        operation_description=(
                'Replace all data of'
                'the accessed context layer for the user.\n'
                'Need to be at least edit data permission.\n\n'
                'Payload is geojson format.'
        )
    )
    @action(detail=False, methods=['post'])
    def replace(self, request, *args, **kwargs):  # noqa DOC110, DOC103
        """
        Replace all data for a specific context layer object.

        :param request: The HTTP request object.
        :type request: rest_framework.request.Request
        :param id: Identifier of the context layer object.
        :type id: int or str
        :return: Detailed data of the context layer object.
        :rtype: rest_framework.response.Response
        """
        output = self.update_data(replace=True)
        layer = self.get_context_layer_object()
        if isinstance(layer, Layer):
            layer.reset_attributes()

        fields(schema_name=layer.schema_name, table_name=layer.table_name)
        return output

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
