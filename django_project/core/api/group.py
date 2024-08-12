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

import csv
import json

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import transaction
from django.http import HttpResponseForbidden, HttpResponseBadRequest
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.models.group import GeosightGroup
from core.models.profile import Profile, RoleDoesNotFound
from core.permissions import (
    RoleContributorAuthenticationPermission, AdminAuthenticationPermission
)
from core.serializer.group import GroupSerializer

User = get_user_model()


class GroupListAPI(APIView):
    """Return Group list."""

    permission_classes = (
        IsAuthenticated, RoleContributorAuthenticationPermission,
    )

    def get(self, request):
        """Return Group list."""
        return Response(
            GroupSerializer(
                GeosightGroup.objects.all(), many=True, exclude=['users']
            ).data
        )

    def delete(self, request):
        """Delete an basemap."""
        user = request.user
        if user.is_authenticated and user.profile.is_admin:
            try:
                ids = json.loads(request.data['ids'])
            except TypeError:
                ids = request.data['ids']
            for obj in GeosightGroup.objects.filter(id__in=ids):
                obj.delete()
            return Response('Deleted')
        else:
            return HttpResponseForbidden()


class GroupDetailAPI(APIView):
    """API for detail of group."""

    permission_classes = (
        IsAuthenticated, RoleContributorAuthenticationPermission,
    )

    def get(self, request, pk):
        """Delete an user."""
        group = get_object_or_404(GeosightGroup, pk=pk)
        return Response(GroupSerializer(group).data)

    def delete(self, request, pk):
        """Delete an user."""
        user = request.user
        if user.is_authenticated and user.profile.is_admin:
            group = get_object_or_404(GeosightGroup, pk=pk)
            group.delete()
            return Response('Deleted')
        else:
            return HttpResponseForbidden()


class GroupUpdateBatchUserAPI(APIView):
    """API for update batch user from API."""

    permission_classes = (
        IsAuthenticated, AdminAuthenticationPermission,
    )

    def post(self, request, pk):
        """Delete an user."""
        group = get_object_or_404(GeosightGroup, pk=pk)
        try:
            reader = csv.DictReader(
                request.FILES['file'].read().decode('utf-8').splitlines(),
                delimiter=','
            )
        except KeyError:
            return HttpResponseBadRequest('CSV should bin in file payload')
        except Exception as e:
            return HttpResponseBadRequest(f'{e}')

        with transaction.atomic():
            # Delete all user
            for user in group.user_set.all():
                user.groups.remove(group)

            try:
                for idx, row in enumerate(list(reader)):
                    try:
                        data = {
                            'first_name': row['First name'],
                            'last_name': row['Last name'],
                            'email': row['Email address']
                        }
                        role = row['Role']
                        try:
                            # If azure, use email instead
                            if settings.USE_AZURE:
                                email = data['email']
                                data['username'] = email
                                if not email:
                                    raise ValueError(
                                        f'Row {idx} has empty Email'
                                    )

                                user = User.objects.get(email=email)
                                user.groups.add(group)
                            # If not azure, use username instead
                            else:
                                username = row['Username']
                                data['username'] = username
                                if not username:
                                    raise ValueError(
                                        f'Row {idx} has empty Username'
                                    )
                                user = User.objects.get(username=username)
                                user.groups.add(group)
                        except User.DoesNotExist:
                            user, _ = User.objects.get_or_create(
                                username=data['username'],
                                defaults=data
                            )
                            try:
                                Profile.update_role(user=user, role=role)
                            except RoleDoesNotFound:
                                raise RoleDoesNotFound(
                                    f'Role of row {idx} does not exist'
                                )
                            user.groups.add(group)
                    except KeyError as e:
                        raise KeyError(
                            f'CSV should contains {e} column'
                        )
            except Exception as e:
                return HttpResponseBadRequest(e)
        return Response(GroupSerializer(group).data)
