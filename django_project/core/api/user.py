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
from django.contrib.auth.mixins import UserPassesTestMixin
from django.http import HttpResponseForbidden
from django.shortcuts import get_object_or_404
from knox.models import AuthToken
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.api.base import FilteredAPI
from core.models.api_key import ApiKey
from core.models.profile import Profile
from core.permissions import AdminAuthenticationPermission
from core.serializer.api_key import ApiKeySerializer
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
        user = request.user
        if user.is_authenticated and user.profile.is_admin:
            ids = json.loads(request.data['ids'])
            for obj in User.objects.filter(id__in=ids):
                obj.delete()
            return Response('Deleted')
        else:
            return HttpResponseForbidden()


class UserDetailAPI(APIView):
    """API for detail of user."""

    permission_classes = (IsAuthenticated, AdminAuthenticationPermission,)

    def delete(self, request, pk):
        """Delete an user."""
        user = get_object_or_404(User, pk=pk)
        user.delete()
        return Response('Deleted')


class UserApiKey(UserPassesTestMixin, APIView):
    """API for user API Key."""

    permission_classes = [IsAuthenticated]

    def handle_no_permission(self):
        """Handle no permission."""
        return HttpResponseForbidden('No permission')

    def test_func(self):
        """Test function of api."""
        if not self.request.user.is_authenticated:
            return False
        if self.request.user.is_superuser:
            return True
        user_id = int(self.kwargs.get('pk'))
        return self.request.user.id == user_id

    def get(self, request, pk):
        """Get token API Key."""
        api_key = ApiKey.objects.filter(token__user_id=pk)
        return Response(status=200, data=(
            ApiKeySerializer(api_key, many=True).data
        ))

    def put(self, request, pk):
        """Activate/deactivate token API Key."""
        if not self.request.user.is_superuser:
            return HttpResponseForbidden('No permission')
        api_key = ApiKey.objects.filter(token__user_id=pk)
        api_key.update(is_active=request.data.get('is_active'))
        return Response(status=204)

    def post(self, request, pk):
        """Create new token API Key."""
        user = get_object_or_404(User, id=pk)
        existing = ApiKey.objects.filter(
            token__user_id=pk
        )
        if existing.exists():
            return Response(status=400, data={
                'detail': (
                    'You have existing API Key! '
                    'Please remove the existing one!'
                )
            })
        # create token
        auth_token, token = AuthToken.objects.create(
            user=user
        )
        ApiKey.objects.create(
            token=auth_token,
            platform=request.data.get('platform', ''),
            owner=request.data.get('owner', user.email),
            contact=request.data.get('contact', ''),
        )
        return Response(
            status=201,
            data={
                'user_id': pk,
                'api_key': token,
                'created': auth_token.created,
                'expiry': auth_token.expiry
            }
        )

    def delete(self, request, pk):
        """Delete token API Key."""
        api_key = ApiKey.objects.filter(token__user_id=pk).first()
        if not api_key:
            return Response(status=404, data={
                'detail': 'not found'
            })
        if not api_key.is_active and not request.user.is_superuser:
            return HttpResponseForbidden('No permission')
        AuthToken.objects.filter(user_id=pk).delete()
        return Response(status=204)
