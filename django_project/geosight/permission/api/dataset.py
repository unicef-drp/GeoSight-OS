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
from django.http import HttpResponse, HttpResponseBadRequest, Http404
from rest_framework.generics import ListAPIView

from core.api.base import FilteredAPI
from core.pagination import Pagination
from geosight.data.models import Indicator
from geosight.georepo.models import (
    ReferenceLayerIndicator, ReferenceLayerView
)
from geosight.permission.access import RoleSuperAdminRequiredMixin
from geosight.permission.models import (
    PERMISSIONS,
    ReferenceLayerIndicatorPermission as Permission,
    ReferenceLayerIndicatorUserPermission as UserPermission,
    ReferenceLayerIndicatorGroupPermission as GroupPermission
)
from geosight.permission.serializer.data_access import (
    GeneralPermissionsSerializer,
    UsersPermissionsSerializer,
    GroupsPermissionsSerializer
)

User = get_user_model()


class DataAccessAPI(
    RoleSuperAdminRequiredMixin, ListAPIView, FilteredAPI
):
    """Abstract API for data access."""

    pagination_class = Pagination
    query_class = Permission
    PERMISSIONS = [
        PERMISSIONS.NONE.name, PERMISSIONS.READ.name, PERMISSIONS.WRITE.name
    ]

    def put(self, request):
        """Update data."""
        try:
            ids = request.data['ids']
            permission = request.data['permission']
            if permission not in self.PERMISSIONS:
                return HttpResponseBadRequest(
                    f'Permission not recognized. Choices : {self.PERMISSIONS}'
                )
            if self.query_class == Permission:
                self.query_class.objects.filter(id__in=ids).update(
                    public_permission=permission
                )
            else:
                self.query_class.objects.filter(id__in=ids).update(
                    permission=permission
                )
        except KeyError as e:
            return HttpResponseBadRequest(f'{e}')
        return HttpResponse(status=204)

    def post(self, request):
        """Delete data."""
        if self.query_class == Permission:
            return Http404('No post action found.')
        try:
            indicators = request.data['indicators']
            datasets = request.data['datasets']
            objects = request.data['objects']
            permission = request.data['permission']
            if permission not in self.PERMISSIONS:
                return HttpResponseBadRequest(
                    f'Permission not recognized. Choices : {self.PERMISSIONS}'
                )

            indicators_query = Indicator.objects.all()
            if indicators:
                indicators_query = indicators_query.filter(id__in=indicators)

            ref_query = ReferenceLayerView.objects.all()
            if datasets:
                ref_query = []
                for dataset in datasets:
                    ref, _ = ReferenceLayerView.objects.get_or_create(
                        identifier=dataset
                    )
                    ref_query.append(ref)

            # Create data per indicator, ref and
            for indicator in indicators_query:
                for reference_layer in ref_query:
                    obj, _ = ReferenceLayerIndicator.objects.get_or_create(
                        reference_layer=reference_layer,
                        indicator=indicator
                    )
                    try:
                        permission_obj = obj.permission
                    except Permission.DoesNotExist:
                        permission_obj, _ = Permission.objects.get_or_create(
                            obj=obj
                        )

                    for obj_id in objects:
                        if self.query_class == UserPermission:
                            self.query_class.objects.get_or_create(
                                obj=permission_obj,
                                user_id=obj_id,
                                defaults={
                                    'permission': permission
                                }
                            )
                        elif self.query_class == GroupPermission:
                            self.query_class.objects.get_or_create(
                                obj=permission_obj,
                                group_id=obj_id,
                                defaults={
                                    'permission': permission
                                }
                            )
        except KeyError as e:
            return HttpResponseBadRequest(f'{e}')
        return HttpResponse(status=201)

    def delete(self, request):
        """Delete data."""
        if self.query_class == Permission:
            return Http404('No delete action found.')
        try:
            ids = request.data['ids']
            self.query_class.objects.filter(id__in=ids).delete()
        except KeyError as e:
            return HttpResponseBadRequest(f'{e}')
        return HttpResponse(status=204)


class DataAccessGeneralAPI(DataAccessAPI):
    """Data access General."""

    serializer_class = GeneralPermissionsSerializer
    query_class = Permission
    permissions = [
        PERMISSIONS.NONE.name, PERMISSIONS.READ.name
    ]

    def get_queryset(self):
        """Return queryset of API."""
        query = ReferenceLayerIndicator.objects.all()
        query = self.filter_query(
            self.request, query,
            ignores=[],
            fields=['reference_layer_id', 'indicator_id']
        )
        output = Permission.objects.filter(
            obj_id__in=query.values_list('id')
        )
        if 'permission__in' in self.request.GET:
            permissions = self.request.GET.get('permission__in').split(',')
            output = output.filter(public_permission__in=permissions)
        return output.order_by(
            'obj__indicator__name', 'obj__reference_layer__name'
        )


class DataAccessUsersAPI(DataAccessAPI):
    """Data access Users."""

    serializer_class = UsersPermissionsSerializer
    query_class = UserPermission

    def get_queryset(self):
        """Return queryset of API."""
        query = ReferenceLayerIndicator.objects.all()
        query = self.filter_query(
            self.request, query,
            ignores=[],
            fields=['reference_layer_id', 'indicator_id']
        )
        output = UserPermission.objects.filter(
            obj__obj_id__in=query.values_list('id')
        )
        output = self.filter_query(
            self.request, output,
            ignores=[],
            fields=['permission', 'user_id']
        )
        return output.order_by(
            'obj__obj__indicator__name',
            'obj__obj__reference_layer__name'
        )


class DataAccessGroupsAPI(DataAccessAPI):
    """Data access Groups."""

    serializer_class = GroupsPermissionsSerializer
    query_class = GroupPermission

    def get_queryset(self):
        """Return queryset of API."""
        query = ReferenceLayerIndicator.objects.all()
        query = self.filter_query(
            self.request, query,
            ignores=[],
            fields=['reference_layer_id', 'indicator_id']
        )
        output = GroupPermission.objects.filter(
            obj__obj_id__in=query.values_list('id')
        )
        output = self.filter_query(
            self.request, output,
            ignores=[],
            fields=['permission', 'group_id']
        )
        return output.order_by(
            'obj__obj__indicator__name',
            'obj__obj__reference_layer__name'
        )
