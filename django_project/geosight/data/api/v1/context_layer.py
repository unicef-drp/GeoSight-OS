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
from geosight.data.models.context_layer import ContextLayer
from geosight.data.serializer.context_layer import (
    ContextLayerBasicSerializer
)
from .base import (
    BaseApiV1ResourceReadOnly,
    BaseApiV1ResourceDeleteOnly
)


class ContextLayerViewSet(
    BaseApiV1ResourceReadOnly,
    BaseApiV1ResourceDeleteOnly
):
    """ContextLayer view set."""

    model_class = ContextLayer
    serializer_class = ContextLayerBasicSerializer
    extra_exclude_fields = [
        'url', 'permission'
    ]

    @swagger_auto_schema(
        operation_id='context-layer-list',
        tags=[ApiTag.CONTEXT_LAYER],
        manual_parameters=[
            *common_api_params,
            ApiParams.NAME_CONTAINS,
            ApiParams.DESCRIPTION_CONTAINS,
            ApiParams.CATEGORIES,
            ApiParams.TYPES,
            ApiParams.PROJECT_SLUGS,
            ApiParams.PROJECT_IDS
        ],
        operation_description=(
                'Return list of accessed context layer for the user.'
        )
    )
    def list(self, request, *args, **kwargs):
        """List of context_layer."""
        return super().list(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_id='context-layer-detail',
        tags=[ApiTag.CONTEXT_LAYER],
        manual_parameters=[],
        operation_description='Return detailed of context layer.'
    )
    def retrieve(self, request, id=None):
        """Return detailed of context layer."""
        return super().retrieve(request, id=id)

    @swagger_auto_schema(
        operation_id='context-layer-detail-delete',
        tags=[ApiTag.CONTEXT_LAYER],
        manual_parameters=[],
        operation_description='Delete a context layer.'
    )
    def destroy(self, request, id=None):
        """Destroy an object."""
        return super().destroy(request, id=id)
