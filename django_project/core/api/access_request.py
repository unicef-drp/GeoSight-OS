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
__date__ = '25/07/2023'
__copyright__ = ('Copyright 2023, Unicef')

from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from core.models.access_request import UserAccessRequest
from core.permissions import AdminAuthenticationPermission
from core.serializer.access_request import (
    AccessRequestSerializer,
    AccessRequestDetailSerializer
)

ACCESS_REQUEST_TYPE_LIST = {
    'user': UserAccessRequest.RequestType.NEW_USER,
    'permission': UserAccessRequest.RequestType.NEW_PERMISSIONS
}
User = get_user_model()


class AccessRequestList(APIView):
    """List access request."""
    permission_classes = (AdminAuthenticationPermission,)

    def get(self, request, request_type, *args, **kwargs):
        if request_type not in ACCESS_REQUEST_TYPE_LIST:
            raise ValidationError(f'Invalid request type: {request_type}')
        status = request.GET.get('status', None)
        results = UserAccessRequest.objects.filter(
            type=ACCESS_REQUEST_TYPE_LIST[request_type]
        ).order_by('-submitted_on')
        if status:
            results = results.filter(status=status)
        return Response(status=200, data=AccessRequestSerializer(
            results, many=True
        ).data)


class AccessRequestDetail(APIView):
    """Approve/Reject access request."""
    permission_classes = (AdminAuthenticationPermission,)

    def get(self, request, pk, *args, **kwargs):
        request_obj = get_object_or_404(UserAccessRequest, pk=pk)
        return Response(
            status=200,
            data=AccessRequestDetailSerializer(request_obj).data
        )
