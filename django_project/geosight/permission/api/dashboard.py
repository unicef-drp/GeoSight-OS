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

from geosight.data.models.dashboard import Dashboard
from geosight.permission.access import share_permission_resource
from geosight.permission.serializer import PermissionSerializer


class DashboardPermissionAPI(APIView):
    """API for list of dashboard."""

    permission_classes = (IsAuthenticated,)

    def get(self, request, slug):
        """Return permission data of dashboard."""
        obj = get_object_or_404(Dashboard, slug=slug)
        share_permission_resource(obj, request.user)
        return Response(
            PermissionSerializer(obj=obj.permission).data
        )

    def post(self, request, slug):
        """Return permission data of dashboard."""
        obj = get_object_or_404(Dashboard, slug=slug)
        share_permission_resource(obj, request.user)
        data = json.loads(request.data['data'])
        obj.permission.update(data)
        return Response('OK')
