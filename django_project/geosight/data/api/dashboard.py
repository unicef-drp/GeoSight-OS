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
__date__ = '13/06/2023'
__copyright__ = ('Copyright 2023, Unicef')

import json

from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from geosight.data.models.dashboard import (
    Dashboard
)
from geosight.data.serializer.dashboard import (
    DashboardBasicSerializer, DashboardSerializer
)
from geosight.permission.access import (
    delete_permission_resource
)


class DashboardListAPI(APIView):
    """Return DashboardLayer list."""

    def get(self, request):
        """Return DashboardLayer list."""
        return Response(
            DashboardBasicSerializer(
                Dashboard.permissions.list(request.user).order_by('name'),
                many=True, context={'user': request.user}
            ).data
        )

    def delete(self, request):
        """Delete objects."""
        ids = json.loads(request.data['ids'])
        for obj in Dashboard.permissions.delete(request.user).filter(
                slug__in=ids):
            obj.delete()
        return Response('Deleted')


CREATE_SLUG = ':CREATE'


class DashboardDetail(APIView):
    """Return all dashboard data."""

    permission_classes = (IsAuthenticated,)

    def delete(self, request, slug):
        """Delete an basemap."""
        dashboard = get_object_or_404(Dashboard, slug=slug)
        delete_permission_resource(dashboard, request.user)
        dashboard.delete()
        return Response('Deleted')


class DashboardData(APIView):
    """Return all dashboard data."""

    def get(self, request, slug):
        """Return all context analysis data."""
        if slug != CREATE_SLUG:
            dashboard = get_object_or_404(Dashboard, slug=slug)
            data = DashboardSerializer(
                dashboard, context={'user': request.user}).data
        else:
            dashboard = Dashboard()
            data = DashboardSerializer(
                dashboard, context={'user': request.user}).data

        return Response(data)
