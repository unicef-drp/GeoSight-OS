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
__date__ = '29/11/2023'
__copyright__ = ('Copyright 2023, Unicef')

from django.core.exceptions import SuspiciousOperation
from django.forms.models import model_to_dict
from django.http import HttpResponseBadRequest
from drf_yasg.utils import swagger_auto_schema
from rest_framework import status, viewsets
from rest_framework.authentication import (
    SessionAuthentication, BasicAuthentication
)
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import mixins, GenericViewSet

from core.api.base import FilteredAPI
from core.auth import BearerAuthentication
from core.pagination import Pagination
from core.permissions import (
    RoleContributorAuthenticationPermission,
    RoleCreatorAuthenticationPermission
)
from geosight.permission.access.mixin import (
    delete_permission_resource,
    read_permission_resource,
    edit_permission_resource
)


class BaseApiV1(FilteredAPI):
    """Base API V1."""

    authentication_classes = [
        SessionAuthentication, BasicAuthentication, BearerAuthentication
    ]
    pagination_class = Pagination
    extra_exclude_fields = []
    non_filtered_keys = [
        'page', 'page_size', 'fields', 'extra_fields', 'permission'
    ]
    keep_exclude_fields = False

    def get_queryset(self):
        """
        Return the filtered queryset for the API.

        This method applies filtering, sorting, and optional distinct
        operations based on the request's query parameters.

        :return: Filtered queryset
        :rtype: QuerySet
        """
        query = self.queryset
        return self.filter_query(
            self.request, query,
            ignores=self.non_filtered_keys,
            sort=self.request.query_params.get('sort'),
            distinct=self.request.query_params.get('distinct'),
        )

    def get_serializer_context(self):
        """
        Return extra context provided to the serializer class.

        This context includes the request, format, view, and user,
        which can be accessed within the serializer.

        :return: A dictionary of context data for the serializer
        :rtype: dict
        """
        return {
            'request': self.request,
            'format': self.format_kwarg,
            'view': self,
            'user': self.request.user
        }

    def get_serializer(self, *args, **kwargs):  # noqa DOC103
        """
        Return the serializer instance.

        Initializes the serializer class with
        the given arguments and keyword arguments,
        along with the context provided by `get_serializer_context()`.

        :param args: Positional arguments passed to the serializer
        :type args: tuple
        :param kwargs: Keyword arguments passed to the serializer
        :type kwargs: dict
        :return: An instance of the serializer class
        :rtype: Serializer
        """
        serializer_class = self.get_serializer_class()
        kwargs.setdefault('context', self.get_serializer_context())

        if self.action in ['list', 'features']:
            fields = self.request.GET.get('fields')
            if not fields:
                kwargs['exclude'] = ['creator'] + self.extra_exclude_fields
                extra_fields = self.request.GET.get('extra_fields')
                if extra_fields:
                    for extra_field in extra_fields.split(','):
                        try:
                            kwargs['exclude'].remove(extra_field)
                        except Exception:
                            pass
            elif fields != '__all__':
                kwargs['fields'] = self.request.GET.get('fields').split(',')

        # Exclude fields if it needs to keep exclude fields
        if self.keep_exclude_fields and self.extra_exclude_fields:
            try:
                kwargs['exclude'] += self.extra_exclude_fields
            except KeyError:
                kwargs['exclude'] = self.extra_exclude_fields

        # Override the exclude if the user is not logged in
        if not self.request.user.is_authenticated:
            try:
                kwargs['exclude'] += ["created_by", "modified_by"]
            except KeyError:
                kwargs['exclude'] = ["created_by", "modified_by"]

        return serializer_class(*args, **kwargs)


class BaseApiV1ResourceReadOnly(BaseApiV1, viewsets.ReadOnlyModelViewSet):
    """Base api v1 for read only."""

    model_class = None
    lookup_field = 'id'
    query_search_fields = ['name', 'description']

    def get_permissions(self):
        """
        Get the permissions based on the current action.

        This method returns a list of instantiated permission classes
        that apply to the current view action
        (e.g., 'list', 'create', 'update').

        :return: A list of permission instances
        :rtype: list
        """
        if self.action in ['create', 'destroy']:
            permission_classes = [RoleCreatorAuthenticationPermission]
        elif self.action in ['update', 'partial_update']:
            permission_classes = [RoleContributorAuthenticationPermission]
        else:
            permission_classes = []
        return [permission() for permission in permission_classes]

    @property
    def queryset(self):
        """
        Return the base queryset used by the view.

        Typically overridden to provide custom filtering, annotations, or
        dynamic behavior based on the request context.

        :return: The base queryset
        :rtype: QuerySet
        """
        # Return by the permission
        permission = self.request.GET.get('permission', None)
        if permission:
            if permission == 'list':
                return self.model_class.permissions.list(self.request.user)
            if permission == 'read':
                return self.model_class.permissions.read(self.request.user)
            if permission == 'read_data':
                return self.model_class.permissions.read_data(
                    self.request.user
                )
            if permission == 'write':
                return self.model_class.permissions.edit(self.request.user)
            if permission == 'write_data':
                return self.model_class.permissions.edit_data(
                    self.request.user
                )
            if permission == 'share':
                return self.model_class.permissions.share(self.request.user)
            if permission == 'delete':
                return self.model_class.permissions.delete(self.request.user)

        try:
            if self.action not in [
                'retrieve', 'create', 'update', 'partial_update', 'destroy'
            ]:
                return self.model_class.permissions.list(self.request.user)
            else:
                return self.model_class.objects.all()
        except AttributeError:
            return self.model_class.objects.all()

    def get_queryset(self):
        """
        Return the queryset used for this API view.

        This method retrieves the base queryset and applies filtering,
        sorting, and distinct operations based
            on the request's query parameters.

        :return: The filtered and processed queryset
        :rtype: QuerySet
        """
        query = self.queryset

        self.request.GET = self.request.GET.copy()

        for param, value in self.request.GET.copy().items():
            if 'category' in param:
                key = param.replace('category', 'group')
                self.request.GET[key] = value
                del self.request.GET[param]

        return self.filter_query(
            self.request, query,
            ignores=self.non_filtered_keys,
            sort=self.request.query_params.get('sort'),
            distinct=self.request.query_params.get('distinct')
        )

    def retrieve(self, request, *args, **kwargs):  # noqa DOC103
        """
        Retrieve the detailed representation of a single object.

        This method handles GET requests for a single instance identified by
        the URL parameters.

        :param request: The HTTP request object
        :type request: Request
        :param args: Additional positional arguments
        :type args: tuple
        :param kwargs:
            Additional keyword arguments (typically includes 'pk' or 'slug')
        :type kwargs: dict
        :return: The HTTP response with serialized object data
        :rtype: Response
        """
        instance = self.get_object()
        read_permission_resource(instance, request.user)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @swagger_auto_schema(auto_schema=None)
    @action(detail=False, methods=['get'])
    def ids(self, request):
        """
        Return a list of object IDs.

        This custom action returns a flat list of primary key values
        (or another lookup field) from the queryset.

        :param request: The HTTP request object
        :type request: Request
        :return: A response containing a list of IDs
        :rtype: Response
        """
        return Response(
            self.get_queryset().values_list(self.lookup_field, flat=True)
        )

    def list(self, request, *args, **kwargs):  # noqa DOC103
        """
        Return a list of dashboard objects.

        Handles GET requests to retrieve a paginated list of
        serialized objects.
        If a SuspiciousOperation occurs, a 400 Bad Request is returned instead.

        :param request: The HTTP request object
        :type request: Request
        :param args: Additional positional arguments
        :type args: tuple
        :param kwargs: Additional keyword arguments
        :type kwargs: dict
        :return: A list of serialized data or a 400 Bad Request response
        :rtype: Response or HttpResponseBadRequest
        """
        try:
            return super().list(request, *args, **kwargs)
        except SuspiciousOperation as e:
            return HttpResponseBadRequest(f'{e}')


class BaseApiV1ResourceDeleteOnly(mixins.DestroyModelMixin):
    """Base api v1 for delete only."""

    model_class = None
    lookup_field = 'id'

    @swagger_auto_schema(auto_schema=None)
    def delete(self, request, *args, **kwargs):  # noqa DOC103
        """
        Delete multiple objects based on provided IDs.

        Expects a list of IDs in the request body under the key `'ids'`.
        Deletes each object the user has permission to delete.

        :param request: The HTTP request containing the list of IDs
        :type request: Request
        :param args: Additional positional arguments
        :type args: tuple
        :param kwargs: Additional keyword arguments
        :type kwargs: dict
        :return: An empty response with HTTP 204 status
        :rtype: Response
        """
        param = f'{self.lookup_field}__in'
        value = request.data['ids']
        for obj in self.model_class.permissions.delete(request.user).filter(
                **{param: value}
        ):
            obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @swagger_auto_schema(auto_schema=None)
    def destroy(self, request, *args, **kwargs):  # noqa DOC103
        """
        Delete a single object.

        Retrieves the instance based on URL parameters,
        checks delete permissions, and performs the deletion.

        :param request: The HTTP request
        :type request: Request
        :param args: Additional positional arguments
        :type args: tuple
        :param kwargs: Additional keyword arguments (usually includes 'pk')
        :type kwargs: dict
        :return: An empty response with HTTP 204 status
        :rtype: Response
        """
        instance = self.get_object()
        delete_permission_resource(instance, request.user)
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)


class BaseApiV1ResourceWriteOnly(
    mixins.CreateModelMixin,
    GenericViewSet
):
    """Base API V1 for Resource."""

    model_class = None
    form_class = None
    lookup_field = 'id'

    def create(self, request, *args, **kwargs):  # noqa DOC103
        """
        Create a new object using form validation.

        Copies request data and validates it using a form class.
        If valid, saves the object,
        assigns the creator, and returns serialized data.

        :param request:
            The HTTP request containing the data to create the object
        :type request: Request
        :param args: Additional positional arguments
        :type args: tuple
        :param kwargs: Additional keyword arguments
        :type kwargs: dict
        :return:
            Serialized data of the created object or form validation errors
        :rtype: Response
        """
        data = request.data.copy()
        form = self.form_class(data)
        form.user = request.user
        if form.is_valid():
            instance = form.save()
            try:
                instance.creator = request.user
            except AttributeError:
                pass
            instance.save()
            serializer = self.get_serializer(instance)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(
            dict(form.errors.items()),
            status=status.HTTP_400_BAD_REQUEST
        )

    def update(self, request, *args, **kwargs):  # noqa DOC103
        """
        Update an existing object.

        Performs full or partial updates using form validation.
        If `partial` is True, only the provided fields are updated.
        Validates user permission before saving.

        :param request: The HTTP request containing the updated data
        :type request: Request
        :param args: Additional positional arguments
        :type args: tuple
        :param kwargs:
            Additional keyword arguments (may include 'partial': bool)
        :type kwargs: dict
        :return:
            Serialized data of the updated object or form validation errors
        :rtype: Response
        """
        partial = kwargs.pop('partial', False)
        data = request.data.copy()

        instance = self.get_object()
        edit_permission_resource(instance, request.user)

        # If it is partial, just save the data from POST
        if partial:
            initial_data = model_to_dict(instance)

            # Use initial data from instance
            try:
                if instance.group:
                    initial_data['group'] = instance.group.name
            except AttributeError:
                pass

            for key, value in data.items():
                initial_data[key] = value
        else:
            # If not partial, it will replace all data
            initial_data = data

        form = self.form_class(
            initial_data,
            instance=instance
        )
        if form.is_valid():
            instance = form.save()
            serializer = self.get_serializer(instance)
            return Response(serializer.data)

        return Response(
            dict(form.errors.items()),
            status=status.HTTP_400_BAD_REQUEST
        )

    def partial_update(self, request, *args, **kwargs):  # noqa DOC103
        """
        Update an existing object partially.

        Marks the update as partial and delegates to the `update` method,
        allowing partial data to be submitted.

        :param request: The HTTP request containing partial data
        :type request: Request
        :param args: Additional positional arguments
        :type args: tuple
        :param kwargs: Additional keyword arguments
        :type kwargs: dict
        :return:
            Serialized data of the updated object or form validation errors
        :rtype: Response
        """
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)


class BaseApiV1Resource(
    BaseApiV1ResourceReadOnly,
    BaseApiV1ResourceWriteOnly,
    BaseApiV1ResourceDeleteOnly,
    GenericViewSet
):
    """Base API V1 for Resource."""

    pass
