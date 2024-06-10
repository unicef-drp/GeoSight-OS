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
__date__ = '06/06/2024'
__copyright__ = ('Copyright 2023, Unicef')

import json

from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from geosight.permission.access import share_permission_resource
from geosight.permission.serializer import PermissionSerializer


class ResourcePermissionAPI(APIView):
    """API for list of resource."""

    permission_classes = (IsAuthenticated,)

    @property
    def model(self):
        raise NotImplemented()

    @property
    def permission_model(self):
        raise NotImplemented()

    def get(self, request, pk):
        """Return permission data of resource."""
        if pk == '0':
            return Response(
                PermissionSerializer(obj=self.permission_model()).data
            )
        obj = get_object_or_404(self.model, pk=pk)
        share_permission_resource(obj, request.user)
        return Response(
            PermissionSerializer(obj=obj.permission).data
        )

    def post(self, request, pk):
        """Return permission data of resource."""
        obj = get_object_or_404(self.model, pk=pk)
        share_permission_resource(obj, request.user)
        data = json.loads(request.data['data'])
        obj.permission.update(data)
        return Response('OK')
