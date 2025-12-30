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
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response

from core.api_utils import common_api_params, ApiTag, ApiParams
from geosight.data.models.dashboard import Dashboard
from geosight.data.serializer.dashboard import DashboardBasicSerializer
from geosight.permission.access import ResourcePermissionDenied
from .base import (
    BaseApiV1ResourceReadOnly,
    BaseApiV1ResourceDeleteOnly
)


class DashboardViewSet(
    BaseApiV1ResourceReadOnly,
    BaseApiV1ResourceDeleteOnly
):
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
        operation_id='dashboard-group-list',
        tags=[ApiTag.DASHBOARD],
        manual_parameters=[],
        operation_description='List dashboard groups.'
    )
    @action(detail=False, methods=['get'])
    def groups(self, request):
        """Return dashboard group list."""
        querysets = self.get_queryset()
        groups = querysets.values_list(
            'group__name', flat=True
        ).distinct().order_by('group__name')
        return Response(groups)

    @swagger_auto_schema(
        operation_id='dashboard-detail',
        tags=[ApiTag.DASHBOARD],
        manual_parameters=[],
        operation_description='Return detailed of dashboard.'
    )
    def retrieve(self, request, slug=None):
        """Return detailed of dashboard."""
        return super().retrieve(request, slug=slug)

    @swagger_auto_schema(
        operation_id='dashboard-detail-delete',
        tags=[ApiTag.DASHBOARD],
        manual_parameters=[],
        operation_description='Delete a dashboard.'
    )
    def destroy(self, request, slug=None):
        """Destroy an object."""
        return super().destroy(request, slug=slug)

    @swagger_auto_schema(
        operation_id='dashboard-detail-as-feature',
        tags=[ApiTag.DASHBOARD],
        manual_parameters=[],
        operation_description='Feature a dashboard.'
    )
    @action(detail=True, methods=['post'], url_path='as-feature')
    def as_feature(self, request, slug=None):
        """Feature a dashboard."""
        try:
            if not request.user.profile.is_admin:
                raise ResourcePermissionDenied
        except AttributeError:
            raise ResourcePermissionDenied
        instance = self.get_object()
        instance.featured = True
        instance.modified_by = request.user
        instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @swagger_auto_schema(
        operation_id='dashboard-detail-remove-as-feature',
        tags=[ApiTag.DASHBOARD],
        manual_parameters=[],
        operation_description='Remove feature a dashboard.'
    )
    @action(detail=True, methods=['post'], url_path='remove-as-feature')
    def remove_as_feature(self, request, slug=None):
        """Feature a dashboard."""
        try:
            if not request.user.profile.is_admin:
                raise ResourcePermissionDenied
        except AttributeError:
            raise ResourcePermissionDenied
        instance = self.get_object()
        instance.featured = False
        instance.modified_by = request.user
        instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
