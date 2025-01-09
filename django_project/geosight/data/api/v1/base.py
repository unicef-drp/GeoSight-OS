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

from django.forms.models import model_to_dict
from rest_framework import status, viewsets
from rest_framework.authentication import (
    SessionAuthentication, BasicAuthentication
)
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

    def get_queryset(self):
        """Return queryset of API."""
        query = self.queryset
        return self.filter_query(
            self.request, query, ['page', 'page_size']
        )


class BaseApiV1ResourceReadOnly(BaseApiV1, viewsets.ReadOnlyModelViewSet):
    """Base api v1 for read only."""

    model_class = None
    lookup_field = 'id'
    extra_exclude_fields = []

    def get_permissions(self):
        """Get the permissions based on the action."""
        if self.action in ['create', 'destroy']:
            permission_classes = [RoleCreatorAuthenticationPermission]
        elif self.action in ['update', 'partial_update']:
            permission_classes = [RoleContributorAuthenticationPermission]
        else:
            permission_classes = []
        return [permission() for permission in permission_classes]

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
        if not self.request.GET.get('all_fields', False):
            kwargs['exclude'] = ['creator'] + self.extra_exclude_fields
        return serializer_class(*args, **kwargs)

    def get_queryset(self):
        """Return queryset of API."""
        if self.action == 'list':
            query = self.model_class.permissions.list(self.request.user)
        else:
            query = self.model_class.objects.all()

        self.request.GET = self.request.GET.copy()

        for param, value in self.request.GET.copy().items():
            if 'category' in param:
                key = param.replace('category', 'group')
                self.request.GET[key] = value
                del self.request.GET[param]

        return self.filter_query(
            self.request, query,
            sort=self.request.query_params.get('sort'),
            ignores=['page', 'page_size', 'all_fields']
        )

    def retrieve(self, request, *args, **kwargs):
        """Retrive the detailed object."""
        instance = self.get_object()
        read_permission_resource(instance, request.user)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class BaseApiV1ResourceDestroy(mixins.DestroyModelMixin):
    """Base api v1 for destroy only."""

    def destroy(self, request, *args, **kwargs):
        """Destroy an object."""
        instance = self.get_object()
        delete_permission_resource(instance, request.user)
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)


class BaseApiV1ResourceDelete(mixins.DestroyModelMixin):
    """Base api v1 for delete only."""

    model_class = None
    lookup_field = 'id'

    def delete(self, request, *args, **kwargs):
        """Destroy an object."""
        param = f'{self.lookup_field}__in'
        value = request.data['ids']
        for obj in self.model_class.permissions.delete(request.user).filter(
                **{param: value}
        ):
            obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class BaseApiV1Resource(
    BaseApiV1ResourceReadOnly,
    mixins.CreateModelMixin,
    BaseApiV1ResourceDestroy,
    GenericViewSet
):
    """Base API V1 for Resource."""

    model_class = None
    form_class = None
    lookup_field = 'id'
    extra_exclude_fields = []

    def create(self, request, *args, **kwargs):
        """Update an object."""
        data = request.data.copy()
        form = self.form_class(data)
        form.user = request.user
        if form.is_valid():
            instance = form.save()
            instance.creator = request.user
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
