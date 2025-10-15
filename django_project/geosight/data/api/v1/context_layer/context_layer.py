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
__date__ = '29/11/2023'
__copyright__ = ('Copyright 2023, Unicef')

from drf_yasg.utils import swagger_auto_schema

from core.api_utils import common_api_params, ApiTag, ApiParams
from geosight.data.api.v1.base import (
    BaseApiV1Resource
)
from geosight.data.forms.context_layer import ContextLayerForm
from geosight.data.models.context_layer import ContextLayer
from geosight.data.serializer.context_layer import (
    ContextLayerSerializer
)


class ContextLayerViewSet(BaseApiV1Resource):
    """ContextLayer view set."""

    model_class = ContextLayer
    serializer_class = ContextLayerSerializer
    form_class = ContextLayerForm
    extra_exclude_fields = [
        'url', 'permission', 'styles', 'label_styles', 'configuration',
        'parameters', 'original_styles', 'original_configuration',
        'data_fields',
        'password', 'username',
        'cloud_native_gis_layer_id', 'arcgis_config',
        'related_table', 'token', 'url_legend', 'group'
    ]

    @swagger_auto_schema(
        operation_id='context-layer-list',
        tags=[ApiTag.CONTEXT_LAYER],
        manual_parameters=[
            *common_api_params,
            ApiParams.NAME_CONTAINS,
            ApiParams.DESCRIPTION_CONTAINS,
            ApiParams.CATEGORIES,
            ApiParams.TYPES
        ],
        operation_description=(
                'Return list of accessed context layer for the user.'
        )
    )
    def list(self, request, *args, **kwargs):  # noqa DOC110, DOC103
        """
        Retrieve a list of available context layers.

        This method handles ``GET`` requests to return a collection
        of context layers that the user has access to. It supports
        filtering and pagination via standard query parameters.

        :param request: The HTTP request object.
        :type request: rest_framework.request.Request
        :param args: Additional positional arguments.
        :param kwargs: Additional keyword arguments.
        :return: Paginated list of context layers.
        :rtype: rest_framework.response.Response
        """
        return super().list(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_id='context-layer-detail',
        tags=[ApiTag.CONTEXT_LAYER],
        manual_parameters=[],
        operation_description='Return detailed of context layer.'
    )
    def retrieve(self, request, id=None):
        """
        Retrieve detailed information for a specific context layer.

        This method handles ``GET`` requests to return all available
        metadata and properties of a specific context layer.

        :param request: The HTTP request object.
        :type request: rest_framework.request.Request
        :param id: Identifier of the context layer to retrieve.
        :type id: int or str
        :return: Detailed information about the context layer.
        :rtype: rest_framework.response.Response
        """
        return super().retrieve(request, id=id)

    @swagger_auto_schema(
        operation_id='context-layer-create',
        tags=[ApiTag.CONTEXT_LAYER],
        manual_parameters=[],
        request_body=ContextLayerSerializer.
        Meta.post_body,
        operation_description='Create a context layer.'
    )
    def create(self, request, *args, **kwargs):
        """Create a new context layer.

        This endpoint creates a new Context Layer
        instance using the data provided in the request payload.

        :param request: The HTTP request object containing creation data.
        :type request: rest_framework.request.Request
        :param *args: Variable length positional arguments.
        :type *args: Any
        :param **kwargs: Arbitrary keyword arguments.
        :type **kwargs: Any
        :return:
            The HTTP response containing the created context layer details.
        :rtype: rest_framework.response.Response
        """
        return super().create(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_id='context-layer-detail-update',
        tags=[ApiTag.CONTEXT_LAYER],
        manual_parameters=[],
        request_body=ContextLayerSerializer.
        Meta.post_body,
        operation_description='Replace a detailed of context layer.'
    )
    def update(self, request, *args, **kwargs):
        """Fully update a context layer.

        This endpoint replaces all fields of a context layer instance
        with the values provided in the request payload.

        :param request: The HTTP request object containing update data.
        :type request: rest_framework.request.Request
        :param *args: Variable length positional arguments.
        :type *args: Any
        :param **kwargs: Arbitrary keyword arguments.
        :type **kwargs: Any
        :return: The HTTP response after the full update.
        :rtype: rest_framework.response.Response
        """
        return super().update(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_id='context-layer-detail-partial-update',
        tags=[ApiTag.CONTEXT_LAYER],
        manual_parameters=[],
        request_body=ContextLayerSerializer.
        Meta.post_body,
        operation_description=(
                'Update just partial data based on payload '
                'a detailed of context layer.'
        )
    )
    def partial_update(self, request, *args, **kwargs):
        """Update a context layer partially.

        This endpoint allows updating specific fields of a context layer
        instance without replacing the entire resource.

        :param request: The HTTP request object.
        :type request: rest_framework.request.Request
        :param *args: Variable length positional arguments.
        :type *args: Any
        :param **kwargs: Arbitrary keyword arguments.
        :type **kwargs: Any
        :return: The HTTP response after partial update.
        :rtype: rest_framework.response.Response
        """
        return super().partial_update(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_id='context-layer-detail-delete',
        tags=[ApiTag.CONTEXT_LAYER],
        manual_parameters=[],
        operation_description='Delete a context layer.'
    )
    def destroy(self, request, id=None):
        """
        Delete a specific context layer.

        This method handles ``DELETE`` requests to remove
        a context layer identified by its ID. The user must
        have the necessary permissions to perform this action.

        :param request: The HTTP request object.
        :type request: rest_framework.request.Request
        :param id: Identifier of the context layer to delete.
        :type id: int or str
        :return: Response indicating successful deletion.
        :rtype: rest_framework.response.Response
        """
        return super().destroy(request, id=id)
