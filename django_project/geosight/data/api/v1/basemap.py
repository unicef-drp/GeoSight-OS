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
__date__ = '04/12/2023'
__copyright__ = ('Copyright 2023, Unicef')

from drf_yasg.utils import swagger_auto_schema

from core.api_utils import common_api_params, ApiTag, ApiParams
from geosight.data.forms.basemap import BasemapFormAPI
from geosight.data.models.basemap_layer import BasemapLayer
from geosight.data.serializer.basemap_layer import BasemapLayerSerializer
from .base import BaseApiV1Resource


class BasemapViewSet(BaseApiV1Resource):
    """Basemap view set."""

    model_class = BasemapLayer
    form_class = BasemapFormAPI
    serializer_class = BasemapLayerSerializer
    extra_exclude_fields = ['parameters']

    @swagger_auto_schema(
        operation_id='basemap-list',
        tags=[ApiTag.BASEMAP],
        manual_parameters=[
            *common_api_params,
            ApiParams.NAME_CONTAINS,
            ApiParams.DESCRIPTION_CONTAINS,
            ApiParams.CATEGORIES,
            ApiParams.TYPES,
            ApiParams.PROJECT_SLUGS,
            ApiParams.PROJECT_IDS
        ],
        operation_description='Return list of accessed basemap for the user.'
    )
    def list(self, request, *args, **kwargs):
        """List of basemap."""
        return super().list(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_id='basemap-detail',
        tags=[ApiTag.BASEMAP],
        manual_parameters=[],
        operation_description='Return detailed of basemap.'
    )
    def retrieve(self, request, id=None):
        """Return detailed of basemap."""
        return super().retrieve(request, id=id)

    @swagger_auto_schema(
        operation_id='basemap-create',
        tags=[ApiTag.BASEMAP],
        manual_parameters=[],
        request_body=BasemapLayerSerializer.
        Meta.swagger_schema_fields['post_body'],
        operation_description='Create a basemap.'
    )
    def create(self, request, *args, **kwargs):
        """Create a basemap."""
        return super().create(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_id='basemap-detail-update',
        tags=[ApiTag.BASEMAP],
        manual_parameters=[],
        request_body=BasemapLayerSerializer.
        Meta.swagger_schema_fields['post_body'],
        operation_description='Replace a detailed of basemap.'
    )
    def update(self, request, *args, **kwargs):
        """Update detailed of basemap."""
        return super().update(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_id='basemap-detail-partial-update',
        tags=[ApiTag.BASEMAP],
        manual_parameters=[],
        request_body=BasemapLayerSerializer.
        Meta.swagger_schema_fields['post_body'],
        operation_description=(
                'Update just partial data based on payload '
                'a detailed of basemap.'
        )
    )
    def partial_update(self, request, *args, **kwargs):
        """Update detailed of basemap."""
        return super().partial_update(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_id='basemap-detail-delete',
        tags=[ApiTag.BASEMAP],
        manual_parameters=[],
        operation_description='Delete a basemap.'
    )
    def destroy(self, request, id=None):
        """Destroy an object."""
        return super().destroy(request, id=id)
