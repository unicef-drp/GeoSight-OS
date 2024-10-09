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
__date__ = '23/07/2024'
__copyright__ = ('Copyright 2023, Unicef')

import json

from django.db.models import Count
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from geosight.permission.access import share_permission_resource
from geosight.permission.serializer import PermissionSerializer


class ResourcePermissionAPI(APIView):
    """API for list of resource."""

    permission_classes = (IsAuthenticated,)

    @property
    def model(self):
        """Return model."""
        raise NotImplemented()

    @property
    def permission_model(self):
        """Return permission model."""
        raise NotImplemented()

    def get(self, request, pk):
        """Return permission data of resource."""
        if pk == '0':
            new_permission = self.permission_model()

            ids = self.request.GET.get('ids', None)
            users_permissions = []
            group_permissions = []
            if ids:
                ids = ids.split(',')
                try:
                    permission_user_model = self.permission_user_model
                    permission_group_model = self.permission_group_model

                    # If there is ids
                    # we can use this for checking same permission for the data
                    Model = self.permission_model
                    output = Model.objects.filter(
                        obj__id__in=ids
                    ).values_list(
                        'public_permission', flat=True
                    ).distinct()
                    if output.count() == 1:
                        new_permission.public_permission = output[0]

                    # Return same users permission
                    users = permission_user_model.objects.filter(
                        obj__obj__id__in=ids
                    ).values_list('user', 'permission').annotate(
                        total=Count('obj__obj__id')
                    )
                    for user in users:
                        if user[2] == len(ids):
                            users_permissions.append(
                                permission_user_model(
                                    user_id=user[0],
                                    permission=user[1],
                                )
                            )
                    # Return same groups permission
                    users = permission_group_model.objects.filter(
                        obj__obj__id__in=ids
                    ).values_list('group', 'permission').annotate(
                        total=Count('obj__obj__id')
                    )
                    for user in users:
                        if user[2] == len(ids):
                            group_permissions.append(
                                permission_group_model(
                                    group_id=user[0],
                                    permission=user[1],
                                )
                            )

                except AttributeError:
                    pass

            return Response(
                PermissionSerializer(
                    obj=new_permission,
                    users_permissions=users_permissions,
                    group_permissions=group_permissions
                ).data
            )
        obj = get_object_or_404(self.model, pk=pk)
        share_permission_resource(obj, request.user)
        return Response(
            PermissionSerializer(obj=obj.permission).data
        )

    def post(self, request, pk):
        """Return permission data of resource."""
        obj = get_object_or_404(self.model, pk=pk)
        share_permission_resource(obj, request.user)
        data = json.loads(request.data['data'])
        obj.permission.update(data)
        return Response('OK')
