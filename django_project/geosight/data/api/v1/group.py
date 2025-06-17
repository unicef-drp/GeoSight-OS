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
__date__ = '15/01/2025'
__copyright__ = ('Copyright 2025, Unicef')

import csv

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.db import transaction
from django.http import HttpResponseBadRequest
from drf_yasg.utils import swagger_auto_schema
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from core.api_utils import common_api_params, ApiTag, ApiParams
from core.forms.group import GroupForm
from core.permissions import (
    AdminAuthenticationPermission, RoleContributorAuthenticationPermission
)
from core.serializer.group import GroupSerializer
from geosight.data.api.v1.base import BaseApiV1

User = get_user_model()


class GroupViewSet(
    BaseApiV1,
    viewsets.ModelViewSet
):
    """Group view set."""

    model_class = Group
    form_class = GroupForm
    serializer_class = GroupSerializer
    extra_exclude_fields = [
        'parameters', 'permission', 'users'
    ]
    lookup_field = 'id'

    @property
    def queryset(self):
        """Return queryset."""
        return self.model_class.objects.all()

    def get_permissions(self):
        """Get the permissions based on the action."""
        if self.action in [
            'create', 'destroy', 'update', 'retrieve', 'partial_update',
            'user_batch'
        ]:
            permission_classes = [AdminAuthenticationPermission]
        else:
            permission_classes = [RoleContributorAuthenticationPermission]
        return [permission() for permission in permission_classes]

    @swagger_auto_schema(
        operation_id='group-list',
        tags=[ApiTag.GROUP],
        manual_parameters=[
            *common_api_params,
            ApiParams.NAME_CONTAINS
        ],
        operation_description='Return list of accessed group for the user.'
    )
    def list(self, request, *args, **kwargs):
        """List of group."""
        return super().list(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_id='group-detail',
        tags=[ApiTag.GROUP],
        manual_parameters=[],
        operation_description='Return detailed of group.'
    )
    def retrieve(self, request, id=None):
        """Return detailed of group."""
        return super().retrieve(request, id=id)

    @swagger_auto_schema(
        operation_id='group-create',
        tags=[ApiTag.GROUP],
        manual_parameters=[],
        operation_description='Create a group.'
    )
    def create(self, request, *args, **kwargs):
        """Create a group."""
        return super().create(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_id='group-detail-update',
        tags=[ApiTag.GROUP],
        manual_parameters=[],
        operation_description='Replace a detailed of group.'
    )
    def update(self, request, *args, **kwargs):
        """Update detailed of group."""
        return super().update(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_id='group-detail-partial-update',
        tags=[ApiTag.GROUP],
        manual_parameters=[],
        operation_description=(
                'Update just partial data based on payload '
                'a detailed of group.'
        )
    )
    def partial_update(self, request, *args, **kwargs):
        """Partial update of object."""
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_id='group-detail-delete',
        tags=[ApiTag.GROUP],
        manual_parameters=[],
        operation_description='Delete a group.'
    )
    def destroy(self, request, id=None):
        """Destroy an object."""
        return super().destroy(request, id=id)

    @swagger_auto_schema(auto_schema=None)
    @action(detail=True, methods=['POST'])
    def user_batch(self, request, id=None):
        """Destroy an object."""
        group = self.get_object()
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
                            'email': row['Email address']
                        }
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
                            pass
                            # TODO:
                            #  We enable this in future
                            # data.update({
                            #     'first_name': row['First name'],
                            #     'last_name': row['Last name'],
                            # })
                            # user, _ = User.objects.get_or_create(
                            #     username=data['username'],
                            #     defaults=data
                            # )
                            # try:
                            #     role = row['Role']
                            #     Profile.update_role(user=user, role=role)
                            # except RoleDoesNotFound:
                            #     raise RoleDoesNotFound(
                            #         f'Role of row {idx} does not exist'
                            #     )
                            # user.groups.add(group)
                    except KeyError as e:
                        raise KeyError(
                            f'CSV should contains {e} column'
                        )
            except Exception as e:
                return HttpResponseBadRequest(e)
        return Response(GroupSerializer(group).data)

    @swagger_auto_schema(auto_schema=None)
    def delete(self, request, *args, **kwargs):
        """Destroy an object."""
        param = f'{self.lookup_field}__in'
        value = request.data['ids']
        for obj in self.model_class.objects.filter(**{param: value}):
            obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
