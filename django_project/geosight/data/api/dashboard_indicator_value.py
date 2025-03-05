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
from urllib import parse
from urllib.parse import parse_qs, urlencode, urlunparse

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
from geosight.data.models.dashboard import Dashboard
from geosight.data.models.indicator import Indicator
from geosight.data.serializer.indicator import (
    IndicatorValueWithGeoDateSerializer
)
from geosight.georepo.models.reference_layer import (
    ReferenceLayerView, ReferenceLayerIndicator
)
from geosight.georepo.serializer.entity import EntitySerializer
from geosight.permission.access import (
    read_permission_resource, ResourcePermissionDenied
)
from geosight.permission.models.factory import PERMISSIONS
from geosight.permission.models.resource import (
    ReferenceLayerIndicatorPermission
)


def version_cache(
        url: str, indicator: Indicator, reference_layer: ReferenceLayerView
):
    """Return version cache."""
    version = indicator.version_with_reference_layer_uuid(
        reference_layer.version_with_uuid
    )
    component = parse.urlparse(url)
    query = parse_qs(component.query, keep_blank_values=True)
    query.pop('reference_layer_uuid', None)
    component = component._replace(query=urlencode(query, True))
    return VersionCache(
        key=urlunparse(component),
        version=version
    )


class _DashboardIndicatorValuesAPI(APIView):
    """Base indicator values API."""

    def check_permission(self, user, indicator):
        """Check permission."""
        reference_layer = self.return_reference_view()
        if not reference_layer:
            return Response([])

        ref, created = ReferenceLayerIndicator.permissions.get_or_create(
            user=user,
            indicator=indicator,
            have_creator=False,
            reference_layer=reference_layer
        )
        try:
            read_permission_resource(ref, user)
        except ReferenceLayerIndicatorPermission.DoesNotExist:
            ref.permission = ReferenceLayerIndicatorPermission(
                organization_permission=PERMISSIONS.NONE.name,
                public_permission=PERMISSIONS.NONE.name
            )
            read_permission_resource(ref, user)
        return reference_layer

    def return_parameters(self, request):
        """Return parameters for data."""
        max_time = request.GET.get('time__lte', None)
        if max_time:
            max_time = date_parser.parse(max_time)
            max_time = datetime.combine(
                max_time, datetime.max.time()
            )
        else:
            max_time = datetime.now()

        min_time = request.GET.get('time__gte', None)
        if min_time:
            min_time = date_parser.parse(min_time).date()
        return min_time, max_time

    def return_reference_view(self):
        """Return reference view."""
        slug = self.kwargs['slug']
        dashboard = get_object_or_404(Dashboard, slug=slug)
        identifier = self.request.GET.get(
            'reference_layer_uuid',
            dashboard.reference_layer.identifier
        )
        reference_layer, _ = ReferenceLayerView.objects.get_or_create(
            identifier=identifier
        )
        return reference_layer


class _DashboardIndicatorValuesListAPI(
    _DashboardIndicatorValuesAPI, ListAPIView
):
    """Base indicator values ListAPI."""

    pagination_class = Pagination
    serializer_class = IndicatorValueWithGeoDateSerializer

    def get(self, request, *args, **kwargs):
        """Return Values."""
        pk = self.kwargs['pk']
        indicator = get_object_or_404(Indicator, pk=pk)
        reference_layer = self.check_permission(self.request.user, indicator)

        # Cache version
        cache = version_cache(
            url=request.get_full_path(),
            reference_layer=reference_layer,
            indicator=indicator
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
        pk = self.kwargs['pk']
        indicator = get_object_or_404(Indicator, pk=pk)
        reference_layer = self.check_permission(self.request.user, indicator)
        min_time, max_time = self.return_parameters(self.request)

        return indicator.values(
            date_data=max_time,
            min_date_data=min_time,
            admin_level=self.request.GET.get('admin_level', None),
            reference_layer=reference_layer
        )


class DashboardIndicatorAllValuesAPI(_DashboardIndicatorValuesListAPI):
    """API for all Values of indicator."""

    def get_queryset(self):
        """Return queryset of API."""
        pk = self.kwargs['pk']
        indicator = get_object_or_404(Indicator, pk=pk)
        reference_layer = self.check_permission(self.request.user, indicator)
        return indicator.values(
            last_value=False,
            reference_layer=reference_layer
        )


class DashboardIndicatorDatesAPI(DashboardIndicatorValuesAPI):
    """API for of indicator."""

    def get(self, request, slug, pk, **kwargs):
        """Return Values."""
        indicator = get_object_or_404(Indicator, pk=pk)
        reference_layer = self.check_permission(request.user, indicator)

        dates = [
            datetime.combine(
                date_str, datetime.min.time(),
                tzinfo=pytz.timezone(settings.TIME_ZONE)
            ).isoformat()
            for date_str in set(
                indicator.query_values(
                    reference_layer=reference_layer
                ).values_list('date', flat=True)
            )
        ]
        dates.sort()

        return Response(dates)


class DashboardEntityDrilldown(_DashboardIndicatorValuesAPI):
    """Return all values for the geometry code."""

    def get(self, request, slug, geom_id):
        """Return values of all indicators in specific geometry.

        :param slug: slug of the dashboard
        :param geom_id: the geom_id
        :return:
        """
        dashboard = get_object_or_404(Dashboard, slug=slug)
        reference_layer = self.return_reference_view()
        entity = reference_layer.entities_set.filter(
            geom_id=geom_id
        ).first()
        if not entity:
            return HttpResponseBadRequest(
                f'Entity with geom_id: {geom_id} does not exist.'
            )
        siblings = entity.siblings
        children = entity.children
        parent = entity.parent

        entities_id = [entity.id] + \
                      [sibling.id for sibling in siblings] + \
                      [children.id for children in children]
        if parent:
            entities_id.append(parent.id)

        # INIDATORS DATA
        indicators = {}
        for dashboard_indicator in dashboard.dashboardindicator_set.all():
            indicator = dashboard_indicator.object
            try:
                reference_layer = self.check_permission(
                    request.user, indicator
                )
                values = indicator.values(
                    date_data=None,
                    min_date_data=None,
                    reference_layer=reference_layer,
                    entities_id=entities_id,
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
                        ).isoformat(),
                        'attributes': value.attributes
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
            values, has_next = related_table.data_with_query(
                country_geom_ids=list(
                    reference_layer.countries.values_list(
                        'geom_id', flat=True
                    )
                ),
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
