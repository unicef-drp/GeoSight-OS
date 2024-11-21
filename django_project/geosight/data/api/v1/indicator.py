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
from rest_framework import viewsets

from geosight.data.models.indicator import Indicator
from geosight.data.serializer.indicator import (
    IndicatorBasicListSerializer
)

from core.api_utils import ApiParams, common_api_params, ApiTag
from .base import BaseApiV1


class IndicatorViewSet(BaseApiV1, viewsets.ReadOnlyModelViewSet):
    """Indicator view set."""

    model_class = Indicator
    serializer_class = IndicatorBasicListSerializer
    extra_exclude_fields = ['parameters']

    @property
    def queryset(self):
        """Return the queryset."""
        return Indicator.permissions.list(self.request.user)

    def get_queryset(self):
        """Return queryset of API."""
        query = self.queryset
        return self.filter_query(
            self.request, query, ['page', 'page_size']
        )

    @swagger_auto_schema(
        operation_id='indicators-get',
        tags=[ApiTag.INDICATORS],
        manual_parameters=[
            *common_api_params,
            ApiParams.NAME_CONTAINS,
            ApiParams.DESCRIPTION_CONTAINS,
            ApiParams.SHORTCODE_CONTAINS,
            ApiParams.CREATED_BY_CONTAINS,
            ApiParams.PROJECT_SLUGS,
            ApiParams.PROJECT_IDS
        ],
        operation_description='Return list of accessed indicators for the user.'
    )
    def list(self, request, *args, **kwargs):
        """List of indicators."""
        return super().list(request, *args, **kwargs)
