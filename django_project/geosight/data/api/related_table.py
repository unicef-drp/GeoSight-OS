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

from geosight.data.models.related_table import RelatedTable
from geosight.data.serializer.related_table import (
    RelatedTableSerializer
)
from geosight.permission.access import (
    read_data_permission_resource, read_permission_resource,
    delete_permission_resource
)


class RelatedTableListAPI(APIView):
    """Return RelatedTable list."""

    def get(self, request):
        """Return RelatedTable list."""
        query = RelatedTable.permissions.list(request.user).order_by('name')
        if request.GET.get('permission', None) == 'edit_data':
            query = RelatedTable.permissions.edit_data(
                request.user).order_by('name')
        if request.GET.get('permission', None) == 'read':
            query = RelatedTable.permissions.read(
                request.user).order_by('name')
        return Response(
            RelatedTableSerializer(
                query,
                many=True, exclude=['rows'], context={'user': request.user}
            ).data
        )

    def delete(self, request):
        """Delete objects."""
        ids = json.loads(request.data['ids'])
        for obj in RelatedTable.permissions.delete(
                request.user
        ).filter(id__in=ids):
            obj.delete()
        return Response('Deleted')


class RelatedTableDetailAPI(APIView):
    """API for detail of RelatedTable."""

    permission_classes = (IsAuthenticated,)

    def get(self, request, pk):
        """Delete an basemap."""
        obj = get_object_or_404(RelatedTable, pk=pk)
        read_permission_resource(obj, request.user)
        return Response(
            RelatedTableSerializer(
                obj, exclude=['rows']
            ).data
        )

    def delete(self, request, pk):
        """Delete an basemap."""
        obj = get_object_or_404(RelatedTable, pk=pk)
        delete_permission_resource(obj, request.user)
        obj.delete()
        return Response('Deleted')


class RelatedTableDataAPI(APIView):
    """API for detail of RelatedTable."""

    def get(self, request, pk):
        """Delete an basemap."""
        obj = get_object_or_404(RelatedTable, pk=pk)
        read_data_permission_resource(obj, request.user)
        return Response(obj.data)
