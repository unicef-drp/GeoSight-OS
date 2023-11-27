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
import time
from datetime import datetime

import pytz
from dateutil import parser as date_parser
from django.conf import settings
from django.http import HttpResponseBadRequest
from django.shortcuts import get_object_or_404
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from core.cache import VersionCache
from core.pagination import Pagination
from geosight.data.models.dashboard import (
    Dashboard
)
from geosight.data.models.indicator import Indicator
from geosight.data.serializer.indicator import (
    IndicatorValueWithGeoDateSerializer
)
from geosight.georepo.models.reference_layer import ReferenceLayerIndicator
from geosight.georepo.serializer.entity import EntitySerializer
from geosight.permission.access import (
    read_permission_resource, ResourcePermissionDenied
)
from geosight.permission.models.factory import PERMISSIONS
from geosight.permission.models.resource import (
    ReferenceLayerIndicatorPermission
)


class _DashboardIndicatorValuesAPI(APIView):
    """Base indicator values API."""

    def check_permission(self, user, dashboard, indicator):
        """Check permission."""
        if not dashboard.reference_layer:
            return Response([])

        ref, created = ReferenceLayerIndicator.permissions.get_or_create(
            user=user,
            indicator=indicator,
            have_creator=False,
            reference_layer=dashboard.reference_layer
        )
        try:
            read_permission_resource(ref, user)
        except ReferenceLayerIndicatorPermission.DoesNotExist:
            ref.permission = ReferenceLayerIndicatorPermission(
                organization_permission=PERMISSIONS.NONE.name,
                public_permission=PERMISSIONS.NONE.name
            )
            read_permission_resource(ref, user)

    def return_parameters(self, request):
        """Return parameters for data."""
        max_time = request.GET.get('time__lte', None)
        if max_time:
            max_time = date_parser.parse(max_time)
        else:
            max_time = datetime.now()

        min_time = request.GET.get('time__gte', None)
        if min_time:
            min_time = date_parser.parse(min_time).date()
        return min_time, max_time


class _DashboardIndicatorValuesListAPI(
    _DashboardIndicatorValuesAPI, ListAPIView
):
    """Base indicator values ListAPI."""

    pagination_class = Pagination
    serializer_class = IndicatorValueWithGeoDateSerializer

    def get(self, request, *args, **kwargs):
        """Return Values."""
        slug = self.kwargs['slug']
        pk = self.kwargs['pk']
        dashboard = get_object_or_404(Dashboard, slug=slug)
        indicator = get_object_or_404(Indicator, pk=pk)
        self.check_permission(self.request.user, dashboard, indicator)

        # Cache version
        cache = VersionCache(
            key=request.get_full_path(), version=indicator.version
        )
        cache_data = cache.get()
        if cache_data:
            return Response(cache_data)
        queryset = self.filter_queryset(self.get_queryset())

        # Get list data and save it to cache
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            assert self.paginator is not None
            response = self.paginator.get_paginated_response_data(
                serializer.data
            )
            cache.set(response)
            return Response(response)

        serializer = self.get_serializer(queryset, many=True)
        response = serializer.data
        cache.set(response)
        return Response(response)


class DashboardIndicatorValuesAPI(_DashboardIndicatorValuesListAPI):
    """API for Values of indicator."""

    def get_queryset(self):
        """Return queryset of API."""
        slug = self.kwargs['slug']
        pk = self.kwargs['pk']
        dashboard = get_object_or_404(Dashboard, slug=slug)
        indicator = get_object_or_404(Indicator, pk=pk)
        self.check_permission(self.request.user, dashboard, indicator)
        min_time, max_time = self.return_parameters(self.request)
        return indicator.values(
            date_data=max_time,
            min_date_data=min_time,
            admin_level=self.request.GET.get('admin_level', None),
            reference_layer=dashboard.reference_layer
        )


class DashboardIndicatorAllValuesAPI(_DashboardIndicatorValuesListAPI):
    """API for all Values of indicator."""

    def get_queryset(self):
        """Return queryset of API."""
        slug = self.kwargs['slug']
        pk = self.kwargs['pk']
        dashboard = get_object_or_404(Dashboard, slug=slug)
        indicator = get_object_or_404(Indicator, pk=pk)
        self.check_permission(self.request.user, dashboard, indicator)
        return indicator.values(
            reference_layer=dashboard.reference_layer,
            last_value=False
        )


class DashboardIndicatorValueListAPI(DashboardIndicatorValuesAPI):
    """API for Values of indicator in periodically."""

    def get(self, request, slug, pk, **kwargs):
        """Return Values."""
        dashboard = get_object_or_404(Dashboard, slug=slug)
        indicator = get_object_or_404(Indicator, pk=pk)
        self.check_permission(request.user, dashboard, indicator)

        # Cache version
        cache = VersionCache(
            key=request.get_full_path(), version=indicator.version
        )
        cache_data = cache.get()
        if cache_data:
            return Response(cache_data)

        min_time, max_time = self.return_parameters(request)
        concept_uuid = request.GET.get('concept_uuid', None)

        query = indicator.query_values(
            date_data=max_time,
            min_date_data=min_time,
            reference_layer=dashboard.reference_layer,
            concept_uuid=concept_uuid
        )
        distinct = ['geom_id', 'concept_uuid']
        frequency = request.GET.get('frequency', 'daily')
        if frequency.lower() == 'daily':
            distinct.append('year')
            distinct.append('month')
            distinct.append('day')
        elif frequency.lower() == 'monthly':
            distinct.append('year')
            distinct.append('month')
        elif frequency.lower() == 'yearly':
            distinct.append('year')

        order_by = ['-' + field for field in distinct]
        order_by.append('-date')
        query = query.order_by(
            *[field for field in order_by]
        ).distinct(*distinct)

        output = []
        for row in query:
            new_date = datetime.combine(
                row.date, datetime.max.time(),
                tzinfo=pytz.timezone(settings.TIME_ZONE)
            )
            row_data = {
                'time': time.mktime(new_date.timetuple()),
                'value': row.value
            }
            extras = request.GET.get('extras', '').split(',')
            if 'concept_uuid' in extras:
                row_data['concept_uuid'] = row.concept_uuid
            if 'date' in extras:
                row_data['date'] = row.date.strftime('%Y-%m-%d')
            output.append(row_data)

        cache.set(output)
        return Response(output)


class DashboardIndicatorDatesAPI(DashboardIndicatorValuesAPI):
    """API for of indicator."""

    def get(self, request, slug, pk, **kwargs):
        """Return Values."""
        dashboard = get_object_or_404(Dashboard, slug=slug)
        indicator = get_object_or_404(Indicator, pk=pk)
        self.check_permission(request.user, dashboard, indicator)

        dates = [
            datetime.combine(
                date_str, datetime.min.time(),
                tzinfo=pytz.timezone(settings.TIME_ZONE)
            ).isoformat()
            for date_str in set(
                indicator.query_values(
                    reference_layer=dashboard.reference_layer
                ).values_list('date', flat=True)
            )
        ]
        dates.sort()

        return Response(dates)


class DashboardIndicatorMetadataAPI(DashboardIndicatorValuesAPI):
    """API for of indicator."""

    def metadata(self, request, dashboard, indicator):
        """Return metadata."""
        self.check_permission(request.user, dashboard, indicator)

        # Cache version
        cache = VersionCache(
            key=request.get_full_path().replace('all', f'{indicator.id}'),
            version=indicator.version
        )
        cache_data = cache.get()
        if cache_data:
            return cache_data

        query = indicator.query_values(
            reference_layer=dashboard.reference_layer
        )
        dates = [
            datetime.combine(
                date_str, datetime.min.time(),
                tzinfo=pytz.timezone(settings.TIME_ZONE)
            ).isoformat()
            for date_str in set(
                query.values_list('date', flat=True)
            )
        ]
        dates.sort()

        response = {
            'dates': dates,
            'count': query.count(),
            'version': indicator.version
        }
        cache.set(response)
        return response

    def get(self, request, slug, pk, **kwargs):
        """Return Values."""
        dashboard = get_object_or_404(Dashboard, slug=slug)
        indicator = get_object_or_404(Indicator, pk=pk)
        return Response(self.metadata(request, dashboard, indicator))


class DashboardIndicatorAllMetadataAPI(DashboardIndicatorMetadataAPI):
    """API for all metadata of indicator on dashboard."""

    def get(self, request, slug, **kwargs):
        """Return Values."""
        dashboard = get_object_or_404(Dashboard, slug=slug)
        responses = {}
        for dashboard_indicator in dashboard.dashboardindicator_set.all():
            indicator = dashboard_indicator.object
            try:
                responses[dashboard_indicator.object.id] = self.metadata(
                    request, dashboard, indicator
                )
            except ResourcePermissionDenied:
                responses[dashboard_indicator.object.id] = {
                    'dates': (
                        "You don't have permission to access this resource"
                    ),
                    'count': 0,
                    'version': indicator.version
                }
        return Response(responses)


class DashboardEntityDrilldown(_DashboardIndicatorValuesAPI):
    """Return all values for the geometry code."""

    def get(self, request, slug, concept_uuid):
        """Return values of all indicators in specific geometry.

        :param slug: slug of the dashboard
        :param concept_uuid: the concept_uuid
        :return:
        """
        dashboard = get_object_or_404(Dashboard, slug=slug)
        entity = dashboard.reference_layer.entity_set.filter(
            concept_uuid=concept_uuid
        ).first()
        if not entity:
            return HttpResponseBadRequest(
                f'Entity with concept_uuid :{concept_uuid} does not exist.'
            )
        try:
            parent = entity.parents[0]
            siblings = dashboard.reference_layer.entity_set.filter(
                parents__contains=parent,
                admin_level=entity.admin_level
            ).exclude(pk=entity.pk)
            parent = dashboard.reference_layer.entity_set.filter(
                geom_id=parent,
                reference_layer=dashboard.reference_layer
            ).first()
        except IndexError:
            siblings = []
            parent = None

        children = dashboard.reference_layer.entity_set.filter(
            parents__contains=entity.geom_id,
            admin_level=entity.admin_level + 1
        )
        concept_uuids = [entity.concept_uuid] + \
                        [sibling.concept_uuid for sibling in siblings] + \
                        [children.concept_uuid for children in children]
        if parent:
            concept_uuids.append(parent.concept_uuid)

        # INIDATORS DATA
        indicators = {}
        for dashboard_indicator in dashboard.dashboardindicator_set.all():
            indicator = dashboard_indicator.object
            try:
                self.check_permission(request.user, dashboard, indicator)
                values = indicator.values(
                    date_data=None,
                    min_date_data=None,
                    reference_layer=dashboard.reference_layer,
                    concept_uuids=concept_uuids,
                    last_value=False
                )
                for value in values:
                    key = value.concept_uuid
                    if key not in indicators:
                        indicators[key] = {}

                    indicator_key = indicator.shortcode if \
                        indicator.shortcode else indicator.id
                    if indicator_key not in indicators[key]:
                        indicators[key][indicator_key] = []

                    indicators[key][indicator_key].append({
                        'value': value.value,
                        'time': datetime.combine(
                            value.date, datetime.min.time(),
                            tzinfo=pytz.timezone(settings.TIME_ZONE)
                        ).isoformat()
                    })
            except ResourcePermissionDenied:
                pass

        # RELATED TABLES DATA
        related_tables = {}
        rt_config = json.loads(request.GET.get('rtconfigs', '{}'))
        for dashboard_related in dashboard.dashboardrelatedtable_set.all():
            related_table = dashboard_related.object
            date_field = None
            date_format = None
            try:
                date_field = rt_config[f'{related_table.id}']['date_field']
                date_format = rt_config[f'{related_table.id}']['date_format']
            except KeyError:
                pass
            values = related_table.data_with_query(
                reference_layer_uuid=dashboard.reference_layer.identifier,
                geo_field=dashboard_related.geography_code_field_name,
                geo_type=dashboard_related.geography_code_type,
                date_field=date_field,
                date_format=date_format,
            )
            for value in values:
                key = value['concept_uuid']
                if key not in related_tables:
                    related_tables[key] = {}
                if related_table.name not in related_tables[key]:
                    related_tables[key][related_table.name] = []
                del value['id']
                del value['order']
                del value['concept_uuid']
                del value['geometry_code']
                related_tables[key][related_table.name].append(value)

        # Construct context
        admin_boundary = EntitySerializer(entity).data
        try:
            admin_boundary['indicators'] = indicators[
                admin_boundary['concept_uuid']
            ]
        except KeyError:
            admin_boundary['indicators'] = {}
        try:
            admin_boundary['related_tables'] = related_tables[
                admin_boundary['concept_uuid']
            ]
        except KeyError:
            admin_boundary['related_tables'] = {}

        # For parent
        if parent:
            admin_boundary['parent'] = EntitySerializer(parent).data
            try:
                admin_boundary['parent']['indicators'] = indicators[
                    parent.concept_uuid
                ]
            except KeyError:
                admin_boundary['parent']['indicators'] = {}

            try:
                admin_boundary['parent']['related_tables'] = related_tables[
                    parent.concept_uuid
                ]
            except KeyError:
                admin_boundary['parent']['related_tables'] = {}

        # For children
        admin_boundary['children'] = EntitySerializer(children, many=True).data
        for child in admin_boundary['children']:
            try:
                child['indicators'] = indicators[child['concept_uuid']]
            except KeyError:
                child['indicators'] = {}

            try:
                child['related_tables'] = related_tables[child['concept_uuid']]
            except KeyError:
                child['related_tables'] = {}

        # For siblings
        admin_boundary['siblings'] = EntitySerializer(siblings, many=True).data
        for sibling in admin_boundary['siblings']:
            try:
                sibling['indicators'] = indicators[
                    sibling['concept_uuid']
                ]
            except KeyError:
                sibling['indicators'] = {}
            try:
                sibling['related_tables'] = related_tables[
                    sibling['concept_uuid']
                ]
            except KeyError:
                sibling['related_tables'] = {}

        return Response(admin_boundary)
