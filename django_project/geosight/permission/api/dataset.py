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

from django.contrib.auth import get_user_model
from django.http import (
    HttpResponse, HttpResponseBadRequest, HttpResponseNotAllowed
)
from django.shortcuts import get_object_or_404
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.api.base import FilteredAPI
from core.pagination import Pagination
from geosight.data.models import Indicator
from geosight.georepo.models import (
    ReferenceLayerIndicator, ReferenceLayerView
)
from geosight.permission.access import (
    share_permission_resource,
    RoleCreatorRequiredMixin
)
from geosight.permission.models import (
    PERMISSIONS,
    ReferenceLayerIndicatorPermission as Permission,
    ReferenceLayerIndicatorUserPermission as UserPermission,
    ReferenceLayerIndicatorGroupPermission as GroupPermission
)
from geosight.permission.serializer import PermissionSerializer
from geosight.permission.serializer.data_access import (
    GeneralPermissionsSerializer,
    UsersPermissionsSerializer,
    GroupsPermissionsSerializer
)

User = get_user_model()


class DataAccessAPI(
    RoleCreatorRequiredMixin, ListAPIView, FilteredAPI
):
    """Abstract API for data access."""

    pagination_class = Pagination
    query_class = Permission
    PERMISSIONS = [
        PERMISSIONS.NONE.name, PERMISSIONS.READ.name, PERMISSIONS.WRITE.name
    ]

    @property
    def indicator_view_query(self):
        """Indicator view query."""
        query = ReferenceLayerIndicator.permissions.share(self.request.user)
        query = self.filter_query(
            self.request, query,
            ignores=[],
            fields=['reference_layer_id', 'indicator_id']
        )
        return query

    def get_allowed_ids(self, ids):
        """Return allowed ids."""
        if not self.request.user.profile.is_admin:
            # Filter the ids
            allowed_ids = list(
                self.get_queryset().values_list('id', flat=True)
            )
            ids = list(set(ids) & set(allowed_ids))
        return ids

    def put(self, request):
        """Update data."""
        try:
            ids = self.get_allowed_ids(request.data['ids'])
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
            return HttpResponseNotAllowed('No post action found.')
        try:
            indicators = request.data['indicators']
            if not isinstance(indicators, list):
                return HttpResponseBadRequest('indicators must be a list.')

            if not self.request.user.profile.is_admin:
                indicators = Indicator.permissions.share(request.user).filter(
                    id__in=indicators
                ).values_list('id', flat=True)
                if not indicators:
                    return HttpResponseBadRequest(
                        'You have no valid indicators.'
                    )

            datasets = request.data['datasets']
            if not isinstance(datasets, list):
                return HttpResponseBadRequest('datasets must be a list.')
            objects = request.data['objects']
            if not isinstance(objects, list):
                return HttpResponseBadRequest('objects must be a list.')
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
            return HttpResponseNotAllowed('No delete action found.')
        try:
            ids = self.get_allowed_ids(request.data['ids'])
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
        output = Permission.objects.filter(
            obj_id__in=self.indicator_view_query.values_list('id')
        )
        if 'permission__in' in self.request.GET:
            permissions = self.request.GET.get('permission__in').split(',')
            output = output.filter(public_permission__in=permissions)

        if self.request.GET.get('sort'):
            output = output.order_by(self.request.GET.get('sort'))
        return output


class DataAccessUsersAPI(DataAccessAPI):
    """Data access Users."""

    serializer_class = UsersPermissionsSerializer
    query_class = UserPermission

    def get_queryset(self):
        """Return queryset of API."""
        output = UserPermission.objects.filter(
            obj__obj_id__in=self.indicator_view_query.values_list('id')
        )
        return self.filter_query(
            self.request, output,
            ignores=[],
            fields=['permission', 'user_id'],
            sort=self.request.GET.get('sort'),
            none_is_null=False
        )


class DataAccessGroupsAPI(DataAccessAPI):
    """Data access Groups."""

    serializer_class = GroupsPermissionsSerializer
    query_class = GroupPermission

    def get_queryset(self):
        """Return queryset of API."""
        output = GroupPermission.objects.filter(
            obj__obj_id__in=self.indicator_view_query.values_list('id')
        )
        return self.filter_query(
            self.request, output,
            ignores=[],
            fields=['permission', 'group_id'],
            sort=self.request.GET.get('sort'),
            none_is_null=False
        )


class IndicatorReferenceLayerPermissionAPI(APIView):
    """Permision for dataset : indicator x reference layer."""

    permission_classes = (IsAuthenticated,)

    def obj(self, indicator_id, reference_layer_id):
        """Return object."""
        indicator = get_object_or_404(Indicator, pk=indicator_id)
        reference_layer = get_object_or_404(
            ReferenceLayerView, identifier=reference_layer_id
        )
        try:
            obj = ReferenceLayerIndicator.objects.get(
                reference_layer=reference_layer,
                indicator=indicator,
            )
        except ReferenceLayerIndicator.DoesNotExist:
            obj = ReferenceLayerIndicator.permissions.create(
                user=self.request.user,
                **{
                    'reference_layer': reference_layer,
                    'indicator': indicator
                }
            )
        return obj

    def get(self, request, indicator_id, reference_layer_id):
        """Return permission dataset."""
        obj = self.obj(indicator_id, reference_layer_id)
        share_permission_resource(obj, request.user)
        return Response(
            PermissionSerializer(obj=obj.permission).data
        )

    def post(self, request, indicator_id, reference_layer_id):
        """Return permission data of indicator."""
        obj = self.obj(indicator_id, reference_layer_id)
        share_permission_resource(obj, request.user)
        data = json.loads(request.data['data'])
        try:
            user_permissions = []
            for user_permission in data['user_permissions']:
                if user_permission['permission'] != PERMISSIONS.OWNER.name:
                    user_permissions.append(user_permission)
            data['user_permissions'] = user_permissions
        except Exception:
            pass
        obj.permission.update(data)
        return Response('OK')
