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
from geosight.data.api.v1.base import BaseApiV1Resource
from geosight.data.forms.indicator import IndicatorForm
from geosight.data.models.indicator import Indicator
from geosight.data.serializer.indicator import (
    IndicatorAdminListSerializer, IndicatorSerializer
)


class IndicatorViewSet(BaseApiV1Resource):
    """Indicator view set."""

    model_class = Indicator
    serializer_class = IndicatorAdminListSerializer
    form_class = IndicatorForm
    extra_exclude_fields = ['url', 'permission']
    query_search_fields = ['name', 'description', 'shortcode']

    @swagger_auto_schema(
        operation_id='indicator-list',
        tags=[ApiTag.INDICATOR],
        manual_parameters=[
            *common_api_params,
            ApiParams.NAME_CONTAINS,
            ApiParams.DESCRIPTION_CONTAINS,
            ApiParams.CATEGORIES,
            ApiParams.TYPES,
            ApiParams.PROJECT_SLUGS,
            ApiParams.PROJECT_IDS
        ],
        operation_description='Return list of accessed indicator for the user.'
    )
    def list(self, request, *args, **kwargs):  # noqa DOC103
        """
        Retrieve a list of indicators available to the user.

        Applies search and filter parameters such as name, description,
        categories, types, and project identifiers.

        :param request: The HTTP request.
        :type request: Request
        :return: A paginated list of serialized Indicator objects.
        :rtype: Response
        """
        return super().list(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_id='indicator-create',
        tags=[ApiTag.INDICATOR],
        manual_parameters=[],
        request_body=IndicatorSerializer.Meta.post_body,
        operation_description='Create a indicator.'
    )
    def create(self, request, *args, **kwargs):
        """Create a new indicator.

        This endpoint creates a new indicator
        instance using the data provided in the request payload.

        :param request: The HTTP request object containing creation data.
        :type request: rest_framework.request.Request
        :param *args: Variable length positional arguments.
        :type *args: Any
        :param **kwargs: Arbitrary keyword arguments.
        :type **kwargs: Any
        :return:
            The HTTP response containing the created indicator details.
        :rtype: rest_framework.response.Response
        """
        return super().create(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_id='indicator-detail-update',
        tags=[ApiTag.INDICATOR],
        manual_parameters=[],
        request_body=IndicatorSerializer.Meta.post_body,
        operation_description='Replace a detailed of indicator.'
    )
    def update(self, request, *args, **kwargs):
        """Fully update a indicator.

        This endpoint replaces all fields of a indicator instance
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
        operation_id='indicator-detail-partial-update',
        tags=[ApiTag.INDICATOR],
        manual_parameters=[],
        request_body=IndicatorSerializer.Meta.post_body,
        operation_description=(
                'Update just partial data based on payload '
                'a detailed of indicator.'
        )
    )
    def partial_update(self, request, *args, **kwargs):
        """Update a indicator partially.

        This endpoint allows updating specific fields of a indicator
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
        operation_id='indicator-detail',
        tags=[ApiTag.INDICATOR],
        manual_parameters=[],
        operation_description='Return detailed of indicator.'
    )
    def retrieve(self, request, id=None):
        """
        Retrieve the detail of a specific indicator by its ID.

        :param request: The HTTP request.
        :type request: Request
        :param id: The ID of the indicator.
        :type id: int or str
        :return: A serialized Indicator object.
        :rtype: Response
        """
        return super().retrieve(request, id=id)

    @swagger_auto_schema(
        operation_id='indicator-detail-delete',
        tags=[ApiTag.INDICATOR],
        manual_parameters=[],
        operation_description='Delete an indicator.'
    )
    def destroy(self, request, id=None):
        """
        Delete a specific indicator by its ID.

        :param request: The HTTP request.
        :type request: Request
        :param id: The ID of the indicator to be deleted.
        :type id: int or str
        :return: A response indicating the result of the delete operation.
        :rtype: Response
        """
        return super().destroy(request, id=id)
