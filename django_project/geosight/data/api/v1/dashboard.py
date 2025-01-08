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
__date__ = '08/01/2025'
__copyright__ = ('Copyright 2025, Unicef')

from drf_yasg.utils import swagger_auto_schema

from core.api_utils import common_api_params, ApiTag, ApiParams
from geosight.data.models.dashboard import Dashboard
from geosight.data.serializer.dashboard import DashboardBasicSerializer
from .base import BaseApiV1ResourceReadOnly


class DashboardViewSet(BaseApiV1ResourceReadOnly):
    """Dashboard view set."""

    model_class = Dashboard
    serializer_class = DashboardBasicSerializer
    extra_exclude_fields = ['parameters']
    lookup_field = 'slug'

    @swagger_auto_schema(
        operation_id='dashboard-list',
        tags=[ApiTag.DASHBOARD],
        manual_parameters=[
            *common_api_params,
            ApiParams.NAME_CONTAINS,
            ApiParams.DESCRIPTION_CONTAINS,
            ApiParams.CATEGORIES
        ],
        operation_description='Return list of accessed dashboard for the user.'
    )
    def list(self, request, *args, **kwargs):
        """List of dashboard."""
        return super().list(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_id='dashboard-detail',
        tags=[ApiTag.DASHBOARD],
        manual_parameters=[],
        operation_description='Return detailed of dashboard.'
    )
    def retrieve(self, request, slug=None):
        """Return detailed of dashboard."""
        return super().retrieve(request, slug=slug)
