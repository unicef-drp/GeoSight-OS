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

from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from geosight.georepo.models.reference_layer import ReferenceLayerView
from geosight.permission.access import share_permission_resource
from geosight.permission.models import ReferenceLayerViewPermission
from geosight.permission.serializer import PermissionSerializer


class ReferenceLayerViewPermissionAPI(APIView):
    """API for list of ReferenceLayerView."""

    permission_classes = (IsAuthenticated,)

    def get(self, request, identifier):
        """Return permission data of basemap."""
        if identifier == '0':
            return Response(
                PermissionSerializer(obj=ReferenceLayerViewPermission()).data
            )
        obj = get_object_or_404(ReferenceLayerView, identifier=identifier)
        share_permission_resource(obj, request.user)
        return Response(
            PermissionSerializer(obj=obj.permission).data
        )

    def post(self, request, identifier):
        """Return permission data of basemap."""
        obj = get_object_or_404(ReferenceLayerView, identifier=identifier)
        share_permission_resource(obj, request.user)
        data = json.loads(request.data['data'])
        obj.permission.update(data)
        return Response('OK')
