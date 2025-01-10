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
from geosight.data.models.indicator import Indicator
from geosight.data.serializer.indicator import (
    IndicatorAdminListSerializer
)
from .base import (
    BaseApiV1ResourceReadOnly,
    BaseApiV1ResourceDestroy,
    BaseApiV1ResourceDelete
)


class IndicatorViewSet(
    BaseApiV1ResourceReadOnly,
    BaseApiV1ResourceDestroy,
    BaseApiV1ResourceDelete
):
    """Indicator view set."""

    model_class = Indicator
    serializer_class = IndicatorAdminListSerializer
    extra_exclude_fields = ['url', 'permission']

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
    def list(self, request, *args, **kwargs):
        """List of indicator."""
        return super().list(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_id='indicator-detail',
        tags=[ApiTag.INDICATOR],
        manual_parameters=[],
        operation_description='Return detailed of indicator.'
    )
    def retrieve(self, request, id=None):
        """Return detailed of indicator."""
        return super().retrieve(request, id=id)

    @swagger_auto_schema(
        operation_id='indicator-detail-delete',
        tags=[ApiTag.INDICATOR],
        manual_parameters=[],
        operation_description='Delete an indicator.'
    )
    def destroy(self, request, id=None):
        """Destroy an object."""
        return super().destroy(request, id=id)

    @swagger_auto_schema(auto_schema=None)
    def delete(self, request):
        """Delete indicators in batch."""
        return super().delete(request)
