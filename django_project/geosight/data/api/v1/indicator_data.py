"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""
__author__ = 'Víctor González'
__date__ = '05/03/2025'
__copyright__ = ('Copyright 2023, Unicef')

import time

from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_control
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response

from core.api_utils import ApiTag
from geosight.data.api.v1.base import BaseApiV1ResourceReadOnly
from geosight.data.models import IndicatorValue
from geosight.data.models.indicator import Indicator
from geosight.data.serializer.indicator_value import IndicatorValueSerializer
from geosight.permission.access import (
    read_permission_resource
)


class IndicatorDataViewSet(BaseApiV1ResourceReadOnly):
    """indicator Data ViewSet."""

    model_class = IndicatorValue
    serializer_class = IndicatorValueSerializer
    non_filtered_keys = [
        'page', 'page_size', 'fields', 'extra_fields', 'permission',
        'attributes', 'version'
    ]

    @property
    def extra_exclude_fields(self):
        """Return extra fields."""
        if self.action == 'retrieve':
            return []
        else:
            return self.non_filtered_keys

    def _get_indicator(self):  # noqa: D102
        indicator_id = self.kwargs.get('indicators_id')
        indicator = get_object_or_404(
            Indicator.objects.filter(pk=indicator_id)
        )
        read_permission_resource(indicator, self.request.user)
        return indicator

    def get_queryset(self):
        """Return queryset of API."""
        indicator = self._get_indicator()
        query = super().get_queryset()
        query = query.filter(
            indicator_id=indicator.id
        )
        return query

    @method_decorator(
        cache_control(public=True, max_age=864000),
        name='dispatch'
    )
    @swagger_auto_schema(
        operation_id='indicator-data-list',
        tags=[ApiTag.INDICATOR],
        operation_description=
        'Return list of indicator data for the user.',
        responses={
            200: openapi.Response(
                description="Resource fetching successful.",
                schema=IndicatorValueSerializer(many=True)
            )
        }
    )
    def list(self, request, *args, **kwargs):
        """List of indicator rows."""
        time.sleep(2)
        return super().list(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_id='indicator-data-detail',
        tags=[ApiTag.INDICATOR],
        operation_description=
        'Return detail of a indicator row for the user.',
        responses={
            200: openapi.Response(
                description="Resource fetching successful.",
                schema=IndicatorValueSerializer(many=False)
            )
        }
    )
    def retrieve(self, request, *args, **kwargs):
        """Get a single indicator row."""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
