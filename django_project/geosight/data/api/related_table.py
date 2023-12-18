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
from datetime import datetime

from dateutil import parser as date_parser
from django.http import HttpResponseBadRequest
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from geosight.data.models.related_table import RelatedTable
from geosight.data.serializer.related_table import (
    RelatedTableSerializer
)
from geosight.georepo.models.entity import Entity, EntityCode
from geosight.permission.access import (
    read_permission_resource, delete_permission_resource,
    read_data_permission_resource
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


class RelatedTableValuesAPI(APIView):
    """API for Values of indicator."""

    def get(self, request, pk, **kwargs):
        """Return Values."""
        related_table = get_object_or_404(RelatedTable, pk=pk)
        read_data_permission_resource(related_table, request.user)
        try:
            reference_layer_uuid = request.GET['reference_layer_uuid']
            geography_code_field_name = request.GET[
                'geography_code_field_name']
            geography_code_type = request.GET['geography_code_type']
        except KeyError as e:
            return HttpResponseBadRequest(f'{e} is required')

        max_time = request.GET.get('time__lte', None)
        if max_time:
            max_time = date_parser.parse(
                max_time.replace(' ', '+')
            )
        else:
            max_time = datetime.now()

        min_time = request.GET.get('time__gte', None)
        if min_time:
            min_time = date_parser.parse(
                min_time.replace(' ', '+')
            ).isoformat()

        data = related_table.data_with_query(
            reference_layer_uuid=reference_layer_uuid,
            geo_field=geography_code_field_name,
            geo_type=geography_code_type,
            date_field=request.GET.get('date_field', None),
            date_format=request.GET.get('date_format', None),
            max_time=max_time.isoformat(),
            min_time=min_time
        )
        return Response(data)


class RelatedTableFieldDataAPI(APIView):
    """API for Values of indicator."""

    def get(self, request, pk, **kwargs):
        """Return Values."""
        related_table = get_object_or_404(RelatedTable, pk=pk)
        read_data_permission_resource(related_table, request.user)
        try:
            data = related_table.data_field(field=request.GET['field'])
            return Response(list(set(data)))
        except KeyError as e:
            return HttpResponseBadRequest(f'{e} is required')


class RelatedTableDatesAPI(APIView):
    """API for of related table."""

    def get(self, request, pk, **kwargs):
        """Return Values."""
        related_table = get_object_or_404(RelatedTable, pk=pk)
        read_data_permission_resource(related_table, request.user)
        try:
            reference_layer_uuid = request.GET['reference_layer_uuid']
            geography_code_field_name = request.GET[
                'geography_code_field_name']
            geography_code_type = request.GET['geography_code_type']

            # Check codes based on code type
            if geography_code_type.lower() == 'ucode':
                codes = Entity.objects.filter(
                    reference_layer__identifier=reference_layer_uuid
                ).values_list('geom_id', flat=True)
            else:
                codes = EntityCode.objects.filter(
                    entity__reference_layer__identifier=reference_layer_uuid,
                    code_type=geography_code_type
                ).values_list('code', flat=True)

            date_field = request.GET['date_field']
        except KeyError as e:
            return HttpResponseBadRequest(f'{e} is required')

        data = related_table.dates_with_query(
            codes, geography_code_field_name, date_field,
            date_format=request.GET.get('date_format', None)
        )
        return Response(data)
