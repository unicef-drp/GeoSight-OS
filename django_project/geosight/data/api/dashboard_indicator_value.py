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
from django.db.models import Q
from django.http import HttpResponseBadRequest
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView

from core.cache import VersionCache
from geosight.data.models.dashboard import Dashboard
from geosight.data.models.indicator import Indicator
from geosight.georepo.models.entity import Entity
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

        entities = Entity.objects.filter(
            Q(geom_id=geom_id) | Q(concept_uuid=geom_id)
        )
        if not entities.first():
            return HttpResponseBadRequest(
                f'Entity with geom_id: {geom_id} does not exist.'
            )

        entities_id = []
        for entity in entities:
            entities_id.append(entity.id)

            # parent
            parent = entity.parent
            if parent:
                entities_id.append(parent.id)

            # siblings
            siblings = entity.siblings
            for sibling in siblings:
                entities_id.append(sibling.id)

            # children
            children = entity.children
            for child in children:
                entities_id.append(child.id)

        entity = entities.first()
        siblings = entity.siblings
        children = entity.children
        parent = entity.parent
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
