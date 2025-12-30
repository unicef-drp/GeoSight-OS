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
    def list(self, request, *args, **kwargs):  # noqa: DOC103
        """
        Return list of accessible dashboards for the authenticated user.

        :param request: The HTTP request object.
        :type request: rest_framework.request.Request

        :param args: Additional positional arguments.
        :type args: tuple

        :param kwargs: Additional keyword arguments.
        :type kwargs: dict

        :return: Paginated list of dashboard objects.
        :rtype: rest_framework.response.Response
        """
        return super().list(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_id='dashboard-group-list',
        tags=[ApiTag.DASHBOARD],
        manual_parameters=[],
        operation_description='List dashboard groups.'
    )
    @action(detail=False, methods=['get'])
    def groups(self, request):
        """
        Return list of dashboard groups accessible to the user.

        Retrieves distinct group names from all dashboards that the
        authenticated user has access to.

        :param request: The HTTP request object.
        :type request: rest_framework.request.Request

        :return: List of unique dashboard group names.
        :rtype: rest_framework.response.Response
        """
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
        """
        Return detailed information for a specific dashboard.

        :param request: The HTTP request object.
        :type request: rest_framework.request.Request

        :param slug: The unique slug identifier of the dashboard.
        :type slug: str

        :return: Detailed dashboard object.
        :rtype: rest_framework.response.Response
        """
        return super().retrieve(request, slug=slug)

    @swagger_auto_schema(
        operation_id='dashboard-detail-delete',
        tags=[ApiTag.DASHBOARD],
        manual_parameters=[],
        operation_description='Delete a dashboard.'
    )
    def destroy(self, request, slug=None):
        """
        Delete a dashboard by its slug.

        :param request: The HTTP request object.
        :type request: rest_framework.request.Request

        :param slug: The unique slug identifier of the dashboard to delete.
        :type slug: str

        :return: Empty response with 204 status code on success.
        :rtype: rest_framework.response.Response
        """
        return super().destroy(request, slug=slug)

    @swagger_auto_schema(
        operation_id='dashboard-detail-as-feature',
        tags=[ApiTag.DASHBOARD],
        manual_parameters=[],
        operation_description='Feature a dashboard.'
    )
    @action(detail=True, methods=['post'], url_path='as-feature')
    def as_feature(self, request, slug=None):  # noqa: DOC503
        """
        Mark a dashboard as featured.

        Sets the featured flag to True for the specified dashboard.
        Only administrators are permitted to perform this action.

        :param request: The HTTP request object containing user information.
        :type request: rest_framework.request.Request

        :param slug: The unique slug identifier of the dashboard to feature.
        :type slug: str

        :return: Empty response with 204 status code on success.
        :rtype: rest_framework.response.Response

        :raises ResourcePermissionDenied: If user is not an administrator.
        :raises Http404: If dashboard with given slug does not exist.
        """
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
    def remove_as_feature(self, request, slug=None):  # noqa: DOC503
        """
        Remove featured status from a dashboard.

        Sets the featured flag to False for the specified dashboard.
        Only administrators are permitted to perform this action.

        :param request: The HTTP request object containing user information.
        :type request: rest_framework.request.Request

        :param slug: The unique slug identifier of the dashboard to unfeature.
        :type slug: str

        :return: Empty response with 204 status code on success.
        :rtype: rest_framework.response.Response

        :raises ResourcePermissionDenied: If user is not an administrator.
        :raises Http404: If dashboard with given slug does not exist.
        """
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
