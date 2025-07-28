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

from django.contrib.auth import get_user_model
from drf_yasg.utils import swagger_auto_schema
from rest_framework import status, viewsets
from rest_framework.response import Response

from core.api_utils import common_api_params, ApiTag, ApiParams
from core.forms.user import UserForm
from core.permissions import (
    AdminAuthenticationPermission, RoleContributorAuthenticationPermission
)
from core.serializer.user import UserSerializer
from geosight.data.api.v1.base import BaseApiV1

User = get_user_model()


class UserViewSet(
    BaseApiV1,
    viewsets.ModelViewSet
):
    """User view set."""

    model_class = User
    form_class = UserForm
    serializer_class = UserSerializer
    lookup_field = 'id'
    keep_exclude_fields = True

    @property
    def extra_exclude_fields(self):
        """Return extra fields to exclude."""
        fields = ['parameters', 'permission']
        if not self.request.user.profile.is_admin:
            fields += [
                "is_staff", "name", "role", "is_contributor", "is_creator",
                "is_admin", "receive_notification"
            ]
        return fields

    @property
    def queryset(self):
        """Return queryset."""
        return self.model_class.objects.all()

    def get_permissions(self):
        """
        Get the permission instances based on the current action.

        Returns a list of permission classes depending on the action.
        - Admin-only actions:
            'create', 'destroy', 'update', 'retrieve',
            'partial_update', 'user_batch'
        - All other actions: contributor-level permissions

        :return: A list of instantiated permission classes
        :rtype: list
        """
        if self.action in [
            'create', 'destroy', 'update', 'retrieve', 'partial_update',
            'user_batch'
        ]:
            permission_classes = [AdminAuthenticationPermission]
        else:
            permission_classes = [RoleContributorAuthenticationPermission]
        return [permission() for permission in permission_classes]

    @swagger_auto_schema(
        operation_id='user-list',
        tags=[ApiTag.USER],
        manual_parameters=[
            *common_api_params,
            ApiParams.NAME_CONTAINS
        ],
        operation_description='Return list of accessed user for the user.'
    )
    def list(self, request, *args, **kwargs):  # noqa DOC103
        """
        Return a list of users accessible to the current user.

        Handles GET requests to retrieve a paginated list of user objects
        the requester has permission to view.

        :param request: The HTTP request
        :type request: Request
        :return: Paginated list of serialized user data
        :rtype: Response
        """
        return super().list(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_id='user-detail',
        tags=[ApiTag.USER],
        manual_parameters=[],
        operation_description='Return detailed of user.'
    )
    def retrieve(self, request, id=None):
        """
        Return the details of a specific user.

        Retrieves and returns the serialized representation of a user
        identified by their ID.

        :param request: The HTTP request
        :type request: Request
        :param id: The ID of the user to retrieve
        :type id: int or str
        :return: Serialized user data
        :rtype: Response
        """
        return super().retrieve(request, id=id)

    @swagger_auto_schema(
        operation_id='user-create',
        tags=[ApiTag.USER],
        manual_parameters=[],
        operation_description='Create a user.'
    )
    def create(self, request, *args, **kwargs):  # noqa DOC103
        """
        Create a new user.

        Validates and creates a user using the data provided in the request.

        :param request: The HTTP request containing user data
        :type request: Request
        :return: Serialized data of the created user
        :rtype: Response
        """
        return super().create(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_id='user-detail-update',
        tags=[ApiTag.USER],
        manual_parameters=[],
        operation_description='Replace a detailed of user.'
    )
    def update(self, request, *args, **kwargs):  # noqa DOC103
        """
        Fully update a user's details.

        Replaces all fields of the user with the data provided in the request.

        :param request: The HTTP request containing updated user data
        :type request: Request
        :return: Serialized data of the updated user
        :rtype: Response
        """
        return super().update(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_id='user-detail-partial-update',
        tags=[ApiTag.USER],
        manual_parameters=[],
        operation_description=(
                'Update just partial data based on payload '
                'a detailed of user.'
        )
    )
    def partial_update(self, request, *args, **kwargs):  # noqa DOC103
        """
        Update a user's details partially .

        Only the fields present in the request payload will be updated.

        :param request: The HTTP request containing partial user data
        :type request: Request
        :return: Serialized data of the updated user
        :rtype: Response
        """
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_id='user-detail-delete',
        tags=[ApiTag.USER],
        manual_parameters=[],
        operation_description='Delete a user.'
    )
    def destroy(self, request, id=None):
        """
        Delete a user.

        Permanently removes the user identified by their ID.

        :param request: The HTTP request
        :type request: Request
        :param id: The ID of the user to delete
        :type id: int or str
        :return: Empty response with 204 No Content
        :rtype: Response
        """
        return super().destroy(request, id=id)

    @swagger_auto_schema(auto_schema=None)
    def delete(self, request, *args, **kwargs):  # noqa DOC103
        """
        Delete multiple users by ID.

        Expects a list of IDs in the `ids` field of the request body.
        All matching user objects will be deleted.

        :param request: The HTTP request containing 'ids' list
        :type request: Request
        :param args: Additional positional arguments
        :param kwargs: Additional keyword arguments
        :return: Empty response with HTTP 204 No Content
        :rtype: Response
        """
        param = f'{self.lookup_field}__in'
        value = request.data['ids']
        for obj in self.model_class.objects.filter(**{param: value}):
            obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
