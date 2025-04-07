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

    def get_queryset(self):
        """Return queryset of API."""
        query = self.queryset
        return self.filter_query(
            self.request, query,
            ignores=self.non_filtered_keys,
            sort=self.request.query_params.get('sort'),
            distinct=self.request.query_params.get('distinct'),
        )

    def get_serializer_context(self):
        """Extra context provided to the serializer class."""
        return {
            'request': self.request,
            'format': self.format_kwarg,
            'view': self,
            'user': self.request.user
        }

    def get_serializer(self, *args, **kwargs):
        """Return the serializer instance."""
        serializer_class = self.get_serializer_class()
        kwargs.setdefault('context', self.get_serializer_context())

        if self.action in ['list']:
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

        return serializer_class(*args, **kwargs)


class BaseApiV1ResourceReadOnly(BaseApiV1, viewsets.ReadOnlyModelViewSet):
    """Base api v1 for read only."""

    model_class = None
    lookup_field = 'id'

    def get_permissions(self):
        """Get the permissions based on the action."""
        if self.action in ['create', 'destroy']:
            permission_classes = [RoleCreatorAuthenticationPermission]
        elif self.action in ['update', 'partial_update']:
            permission_classes = [RoleContributorAuthenticationPermission]
        else:
            permission_classes = []
        return [permission() for permission in permission_classes]

    @property
    def queryset(self):
        """Return queryset."""
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
        """Return queryset of API."""
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

    def retrieve(self, request, *args, **kwargs):
        """Retrive the detailed object."""
        instance = self.get_object()
        read_permission_resource(instance, request.user)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @swagger_auto_schema(auto_schema=None)
    @action(detail=False, methods=['get'])
    def ids(self, request):
        """Return object id list."""
        return Response(
            self.get_queryset().values_list(self.lookup_field, flat=True)
        )

    def list(self, request, *args, **kwargs):
        """List of dashboard."""
        try:
            return super().list(request, *args, **kwargs)
        except SuspiciousOperation as e:
            return HttpResponseBadRequest(f'{e}')


class BaseApiV1ResourceDeleteOnly(mixins.DestroyModelMixin):
    """Base api v1 for delete only."""

    model_class = None
    lookup_field = 'id'

    @swagger_auto_schema(auto_schema=None)
    def delete(self, request, *args, **kwargs):
        """Destroy an object."""
        param = f'{self.lookup_field}__in'
        value = request.data['ids']
        for obj in self.model_class.permissions.delete(request.user).filter(
                **{param: value}
        ):
            obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @swagger_auto_schema(auto_schema=None)
    def destroy(self, request, *args, **kwargs):
        """Destroy an object."""
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

    def create(self, request, *args, **kwargs):
        """Update an object."""
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

    def update(self, request, *args, **kwargs):
        """Update an object."""
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

    def partial_update(self, request, *args, **kwargs):
        """Partial update of object."""
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
