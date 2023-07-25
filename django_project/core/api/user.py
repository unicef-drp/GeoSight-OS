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

from django.conf import settings
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.api.base import FilteredAPI
from core.models.profile import Profile
from core.permissions import AdminAuthenticationPermission
from core.serializer.user import UserSerializer
from geosight.permission.access import RoleContributorRequiredMixin

User = get_user_model()


class UserListAPI(RoleContributorRequiredMixin, APIView, FilteredAPI):
    """Return User list."""

    def get(self, request):
        """Return User list."""
        profiles = self.filter_query(
            self.request, Profile.objects.all(),
            ignores=[], fields=['role']
        )

        query = User.objects.all().order_by('username')
        if settings.USE_AZURE:
            query = query.exclude(email='')
        query = query.filter(id__in=profiles.values_list('user_id', flat=True))
        query = self.filter_query(
            self.request, query, ['page', 'page_size', 'role']
        )
        return Response(UserSerializer(query, many=True).data)

    def delete(self, request):
        """Delete an basemap."""
        ids = json.loads(request.data['ids'])
        for obj in User.objects.filter(id__in=ids):
            obj.delete()
        return Response('Deleted')


class UserDetailAPI(APIView):
    """API for detail of user."""

    permission_classes = (IsAuthenticated, AdminAuthenticationPermission,)

    def delete(self, request, pk):
        """Delete an user."""
        user = get_object_or_404(User, pk=pk)
        user.delete()
        return Response('Deleted')
