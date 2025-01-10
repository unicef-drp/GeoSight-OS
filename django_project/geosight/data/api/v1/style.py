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
__date__ = '10/01/2025'
__copyright__ = ('Copyright 2025, Unicef')

from drf_yasg.utils import swagger_auto_schema

from core.api_utils import common_api_params, ApiTag, ApiParams
from geosight.data.forms.style import StyleForm
from geosight.data.models.style import Style
from geosight.data.serializer.style import StyleSerializer
from .base import BaseApiV1Resource


class StyleViewSet(BaseApiV1Resource):
    """Style view set."""

    model_class = Style
    form_class = StyleForm
    serializer_class = StyleSerializer
    extra_exclude_fields = [
        'permission', 'styles', 'style_config', 'value_type'
    ]

    @swagger_auto_schema(
        operation_id='style-list',
        tags=[ApiTag.STYLE],
        manual_parameters=[
            *common_api_params,
            ApiParams.NAME_CONTAINS,
            ApiParams.DESCRIPTION_CONTAINS,
            ApiParams.CATEGORIES,
            ApiParams.TYPES,
            ApiParams.PROJECT_SLUGS,
            ApiParams.PROJECT_IDS
        ],
        operation_description='Return list of accessed style for the user.'
    )
    def list(self, request, *args, **kwargs):
        """List of style."""
        return super().list(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_id='style-detail',
        tags=[ApiTag.STYLE],
        manual_parameters=[],
        operation_description='Return detailed of style.'
    )
    def retrieve(self, request, id=None):
        """Return detailed of style."""
        return super().retrieve(request, id=id)

    @swagger_auto_schema(
        operation_id='style-create',
        tags=[ApiTag.STYLE],
        manual_parameters=[],
        operation_description='Create a style.'
    )
    def create(self, request, *args, **kwargs):
        """Create a style."""
        return super().create(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_id='style-detail-update',
        tags=[ApiTag.STYLE],
        manual_parameters=[],
        operation_description='Replace a detailed of style.'
    )
    def update(self, request, *args, **kwargs):
        """Update detailed of style."""
        return super().update(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_id='style-detail-partial-update',
        tags=[ApiTag.STYLE],
        manual_parameters=[],
        operation_description=(
                'Update just partial data based on payload '
                'a detailed of style.'
        )
    )
    def partial_update(self, request, *args, **kwargs):
        """Update detailed of style."""
        return super().partial_update(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_id='style-detail-delete',
        tags=[ApiTag.STYLE],
        manual_parameters=[],
        operation_description='Delete a style.'
    )
    def destroy(self, request, id=None):
        """Destroy an object."""
        return super().destroy(request, id=id)

    @swagger_auto_schema(auto_schema=None)
    def delete(self, request):
        """Delete style in batch."""
        return super().delete(request)
