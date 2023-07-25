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

from core.models.group import GeosightGroup
from core.permissions import AdminAuthenticationPermission
from core.serializer.group import GroupSerializer
from core.serializer.user import UserSerializer


class GroupListAPI(APIView):
    """Return Group list."""

    permission_classes = (IsAuthenticated, AdminAuthenticationPermission,)

    def get(self, request):
        """Return Group list."""
        return Response(
            GroupSerializer(GeosightGroup.objects.all(), many=True).data
        )

    def delete(self, request):
        """Delete an basemap."""
        ids = json.loads(request.data['ids'])
        for obj in GeosightGroup.objects.filter(id__in=ids):
            obj.delete()
        return Response('Deleted')


class GroupDetailAPI(APIView):
    """API for detail of group."""

    permission_classes = (IsAuthenticated, AdminAuthenticationPermission,)

    def get(self, request, pk):
        """Delete an user."""
        group = get_object_or_404(GeosightGroup, pk=pk)
        return Response({
            'users': UserSerializer(group.user_set.all(), many=True).data
        })

    def delete(self, request, pk):
        """Delete an user."""
        group = get_object_or_404(GeosightGroup, pk=pk)
        group.delete()
        return Response('Deleted')
