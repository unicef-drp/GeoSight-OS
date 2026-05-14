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
__date__ = '07/05/2026'
__copyright__ = ('Copyright 2026, Unicef')

from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.permissions import AdminAuthenticationPermission
from geosight.data.models.sdmx import SDMXConfig
from geosight.data.serializer.sdmx import SDMXConfigSerializer


class SDMXConfigListAPI(APIView):
    """Return SDMXConfig list."""

    def get_permissions(self):
        """Return permissions based on HTTP method.

        :return: List of permission instances.
        :rtype: list
        """
        if self.request.method == 'GET':
            return [IsAuthenticated()]
        return [AdminAuthenticationPermission()]

    def get(self, request):
        """Return SDMXConfig list.

        :param request: HTTP request.
        :type request: rest_framework.request.Request

        :return: Serialized list of SDMXConfig objects.
        :rtype: rest_framework.response.Response
        """
        return Response(
            SDMXConfigSerializer(
                SDMXConfig.objects.all().order_by('name'), many=True
            ).data
        )

    def post(self, request):
        """Create a new SDMXConfig.

        :param request: HTTP request containing SDMXConfig data.
        :type request: rest_framework.request.Request

        :return: Serialized created SDMXConfig with status 201.
        :rtype: rest_framework.response.Response
        """
        serializer = SDMXConfigSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=201)


class SDMXConfigDetailAPI(APIView):
    """API for detail of SDMXConfig."""

    def get_permissions(self):
        """Return permissions based on HTTP method.

        :return: List of permission instances.
        :rtype: list
        """
        if self.request.method == 'GET':
            return [IsAuthenticated()]
        return [AdminAuthenticationPermission()]

    def get(self, request, pk):
        """Return SDMXConfig detail.

        :param request: HTTP request.
        :type request: rest_framework.request.Request
        :param pk: Primary key of the SDMXConfig.
        :type pk: int

        :return: Serialized SDMXConfig object.
        :rtype: rest_framework.response.Response
        """
        obj = get_object_or_404(SDMXConfig, pk=pk)
        return Response(SDMXConfigSerializer(obj).data)

    def put(self, request, pk):
        """Update an SDMXConfig.

        :param request: HTTP request containing updated data.
        :type request: rest_framework.request.Request
        :param pk: Primary key of the SDMXConfig.
        :type pk: int

        :return: Serialized updated SDMXConfig object.
        :rtype: rest_framework.response.Response
        """
        obj = get_object_or_404(SDMXConfig, pk=pk)
        serializer = SDMXConfigSerializer(obj, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def patch(self, request, pk):
        """Update an SDMXConfig.

        :param request: HTTP request containing partial data.
        :type request: rest_framework.request.Request
        :param pk: Primary key of the SDMXConfig.
        :type pk: int

        :return: Serialized updated SDMXConfig object.
        :rtype: rest_framework.response.Response
        """
        obj = get_object_or_404(SDMXConfig, pk=pk)
        serializer = SDMXConfigSerializer(obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk):
        """Delete an SDMXConfig.

        :param request: HTTP request.
        :type request: rest_framework.request.Request
        :param pk: Primary key of the SDMXConfig.
        :type pk: int

        :return: Empty response with status 204.
        :rtype: rest_framework.response.Response
        """
        obj = get_object_or_404(SDMXConfig, pk=pk)
        obj.delete()
        return Response(status=204)
