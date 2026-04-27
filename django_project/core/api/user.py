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

from django.contrib.auth import get_user_model
from django.contrib.auth.mixins import UserPassesTestMixin
from django.http import HttpResponseForbidden
from django.shortcuts import get_object_or_404
from knox.models import AuthToken
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.models.api_key import ApiKey
from core.serializer.api_key import ApiKeySerializer

User = get_user_model()


class UserChangePassword(UserPassesTestMixin, APIView):
    """API for changing own password."""

    permission_classes = [IsAuthenticated]

    def handle_no_permission(self):
        """Handle no permission.

        :returns: HTTP 403 Forbidden response.
        :rtype: HttpResponseForbidden
        """
        return HttpResponseForbidden('No permission')

    def test_func(self):
        """Only the user themselves can change their password.

        :returns: True if the authenticated user matches the requested pk.
        :rtype: bool
        """
        if not self.request.user.is_authenticated:
            return False
        user_id = int(self.kwargs.get('pk'))
        return self.request.user.id == user_id

    def post(self, request, pk):
        """Change password for the authenticated user.

        :param request: The HTTP request containing old_password and
            new_password in its data.
        :type request: rest_framework.request.Request
        :param pk: Primary key of the user whose password is being changed.
        :type pk: int
        :returns: 200 on success, 400 if passwords are missing or incorrect.
        :rtype: rest_framework.response.Response
        """
        old_password = request.data.get('old_password', '')
        new_password = request.data.get('new_password', '')
        if not old_password or not new_password:
            return Response(
                status=400,
                data={'detail': 'old_password and new_password are required.'}
            )
        user = get_object_or_404(User, id=pk)
        if not user.check_password(old_password):
            return Response(
                status=400,
                data={'detail': 'Old password is incorrect.'}
            )
        user.set_password(new_password)
        user.save()
        return Response(
            status=200, data={'detail': 'Password changed successfully.'}
        )


class UserApiKey(UserPassesTestMixin, APIView):
    """API for user API Key."""

    permission_classes = [IsAuthenticated]

    def handle_no_permission(self):
        """Handle no permission.

        :returns: HTTP 403 Forbidden response.
        :rtype: HttpResponseForbidden
        """
        return HttpResponseForbidden('No permission')

    def test_func(self):
        """Test function of api.

        :returns: True if user is superuser or matches the requested pk.
        :rtype: bool
        """
        if not self.request.user.is_authenticated:
            return False
        if self.request.user.is_superuser:
            return True
        user_id = int(self.kwargs.get('pk'))
        return self.request.user.id == user_id

    def get(self, request, pk):
        """Get token API Key.

        :param request: The incoming HTTP request.
        :type request: rest_framework.request.Request
        :param pk: Primary key of the user whose API keys are retrieved.
        :type pk: int
        :returns: 200 with serialized list of API keys.
        :rtype: rest_framework.response.Response
        """
        api_key = ApiKey.objects.filter(token__user_id=pk)
        return Response(status=200, data=(
            ApiKeySerializer(api_key, many=True).data
        ))

    def put(self, request, pk):
        """Activate/deactivate token API Key.

        :param request: The HTTP request containing ``is_active`` in its data.
        :type request: rest_framework.request.Request
        :param pk: Primary key of the user whose API keys are updated.
        :type pk: int
        :returns: 204 on success, 403 if the requester is not a superuser.
        :rtype: rest_framework.response.Response or HttpResponseForbidden
        """
        if not self.request.user.is_superuser:
            return HttpResponseForbidden('No permission')
        api_key = ApiKey.objects.filter(token__user_id=pk)
        api_key.update(is_active=request.data.get('is_active'))
        return Response(status=204)

    def post(self, request, pk):
        """Create new token API Key.

        :param request: The HTTP request containing optional ``platform``,
            ``owner``, and ``contact`` fields in its data.
        :type request: rest_framework.request.Request
        :param pk: Primary key of the user for whom the API key is created.
        :type pk: int
        :returns: 201 with new token details, 400 if a key already exists.
        :rtype: rest_framework.response.Response
        """
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
        """Delete token API Key.

        :param request: The incoming HTTP request.
        :type request: rest_framework.request.Request
        :param pk: Primary key of the user whose API key is deleted.
        :type pk: int
        :returns: 204 on success, 404 if no key exists, 403 if the key is
            inactive and the requester is not a superuser.
        :rtype: rest_framework.response.Response or HttpResponseForbidden
        """
        api_key = ApiKey.objects.filter(token__user_id=pk).first()
        if not api_key:
            return Response(status=404, data={
                'detail': 'not found'
            })
        if not api_key.is_active and not request.user.is_superuser:
            return HttpResponseForbidden('No permission')
        AuthToken.objects.filter(user_id=pk).delete()
        return Response(status=204)
