"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""
__author__ = 'Víctor González'
__date__ = '12/02/2024'
__copyright__ = ('Copyright 2023, Unicef')

from datetime import datetime

from dateutil import parser as date_parser
from django.conf import settings
from django.http import HttpResponseBadRequest
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response
from rest_framework.utils.urls import replace_query_param

from core.api_utils import ApiTag
from core.pagination import Pagination
from geosight.data.models.related_table import RelatedTable
from geosight.permission.access import read_data_permission_resource


class RelatedTableValuesPagination(Pagination):
    """Return pagination."""

    has_next = False
    page_number = 0

    def get_next_link(self):
        """Return next link."""
        if not self.has_next:
            return None
        url = self.request.build_absolute_uri()
        page_number = self.page_number + 1
        return replace_query_param(url, self.page_query_param, page_number)

    def get_previous_link(self):
        """Return previous link."""
        has_previous = self.page_number > 1
        if not has_previous:
            return None
        url = self.request.build_absolute_uri()
        page_number = self.page_number - 1
        return replace_query_param(url, self.page_query_param, page_number)


class RelatedTableGeoDataViewSet(viewsets.ReadOnlyModelViewSet):
    """Related Table Data ViewSet."""

    queryset = RelatedTable.objects.all()

    def _get_related_table(self):  # noqa: D102
        related_table = get_object_or_404(
            RelatedTable, pk=self.kwargs.get('related_tables_id')
        )
        read_data_permission_resource(related_table, self.request.user)
        return related_table

    @swagger_auto_schema(
        operation_id='related-table-geo-data-list',
        tags=[ApiTag.RELATED_TABLE_DATA],
        operation_description=
        'Return list of data with geospatial data.',
        responses={
            200: openapi.Response(
                description="Resource fetching successful."
            )
        }
    )
    def list(self, request, *args, **kwargs):
        """List of related table rows."""
        related_table = self._get_related_table()
        try:
            country_geom_ids = request.GET['country_geom_ids'].split(',')
            geo_field = request.GET['geography_code_field_name']
            geo_type = request.GET['geography_code_type']
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
        page_size = request.GET.get('page_size', settings.DEFAULT_PAGE_SIZE)
        page = request.GET.get('page', None)
        offset = None
        if page is not None:
            page = int(page)
            if page == 0:
                return HttpResponseBadRequest("Page can't be zero")
            offset = (page - 1) * int(page_size)

        data, has_next = related_table.data_with_query(
            country_geom_ids=country_geom_ids,
            geo_field=geo_field,
            geo_type=geo_type,
            date_field=request.GET.get('date_field', None),
            date_format=request.GET.get('date_format', None),
            max_time=max_time.isoformat(),
            min_time=min_time,
            limit=page_size,
            offset=offset
        )

        # -------------------------------------
        # If needs pagination
        # -------------------------------------
        if page is not None:
            pagination = RelatedTableValuesPagination()
            pagination.page_number = int(page)
            pagination.page_size = page_size
            pagination.request = self.request
            pagination.has_next = has_next
            data = {
                'next': pagination.get_next_link(),
                'previous': pagination.get_previous_link(),
                'page_size': page_size,
                'results': data
            }
        return Response(data)

    @swagger_auto_schema(auto_schema=None)
    @action(detail=False, methods=['get'])
    def dates(self, request, *args, **kwargs):
        """Get dates of data."""
        related_table = self._get_related_table()
        try:
            country_geom_ids = request.GET['country_geom_ids'].split(',')
            geo_field = request.GET['geography_code_field_name']
            geo_type = request.GET['geography_code_type']
        except KeyError as e:
            return HttpResponseBadRequest(f'{e} is required')

        data = related_table.dates_with_query(
            country_geom_ids=country_geom_ids,
            geo_field=geo_field,
            geo_type=geo_type,
            date_field=request.GET.get('date_field', None),
            date_format=request.GET.get('date_format', None),
        )
        return Response(data)

    @swagger_auto_schema(auto_schema=None)
    @action(detail=False, methods=['get'])
    def data_field(self, request, *args, **kwargs):
        """Get data field."""
        related_table = self._get_related_table()
        try:
            field = request.GET['field']
            geo_field = None
            geo_type = None
            country_geom_ids = request.GET.get('country_geom_ids')
            if country_geom_ids:
                country_geom_ids = country_geom_ids.split(',')
                geo_field = request.GET['geography_code_field_name']
                geo_type = request.GET['geography_code_type']
        except KeyError as e:
            return HttpResponseBadRequest(f'{e} is required')

        data = related_table.data_field(
            field=field,
            country_geom_ids=country_geom_ids,
            geo_type=geo_type,
            geo_field=geo_field
        )
        return Response(data)
