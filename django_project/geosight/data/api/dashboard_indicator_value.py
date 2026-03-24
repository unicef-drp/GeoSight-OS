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
from geosight.data.models.indicator import (
    Indicator, IndicatorValueWithGeo, IndicatorValue
)
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
    """
    Return a version cache for a given indicator and reference layer.

    This function builds a version cache key by removing the
    ``reference_layer_uuid`` query parameter from the provided URL,
    then associates the resulting URL with the indicator version that
    matches the given reference layer.

    :param str url: The URL used to generate the cache key.
    :param Indicator indicator: The indicator object, which provides
        version information relative to the reference layer.
    :param ReferenceLayerView reference_layer: The reference layer
        view containing the ``version_with_uuid`` value.
    :return: A ``VersionCache`` instance containing the processed key
        and version.
    :rtype: VersionCache
    """
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
        """
        Check user permission for a given indicator and reference layer.

        This method ensures the user has read permissions for the given
        indicator within the associated reference layer. If the permission
        record does not exist, it initializes a default permission with
        ``PERMISSIONS.NONE``.

        :param user: The user whose permissions are being checked.
        :type user: User
        :param indicator: The indicator object to check permission against.
        :type indicator: Indicator
        :return: The reference layer associated with the check.
        :rtype: ReferenceLayerView
        """
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
        """
        Extract and return the time range parameters from a request.

        This method parses the ``time__gte`` and ``time__lte`` query
        parameters to determine the minimum and maximum timestamps used
        for data filtering. If ``time__lte`` is not provided, the current
        datetime is used as the maximum time.

        :param request: The incoming HTTP request containing query parameters.
        :type request: rest_framework.request.Request
        :return: A tuple containing ``(min_time, max_time)``.
        :rtype: tuple[datetime.date | None, datetime]
        """
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
        """
        Retrieve or create the reference layer view for the current request.

        This method fetches the reference layer view based on the
        ``reference_layer_uuid`` query parameter, or falls back to the
        dashboard's default reference layer identifier.

        :return: The reference layer view associated with the current request.
        :rtype: ReferenceLayerView
        """
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
        """
        Return values of all datafor a specific geometry.

        This method retrieves all indicators and related table data associated
        with the specified geometry (`geom_id`) within a dashboard (`slug`).
        It compiles indicator values, related table records, and hierarchical
        entity relationships (parent, siblings, and children) into a structured
        response.

        The returned data includes:
            - Indicator values for the selected entity and its related entities
            - Related table data per concept
            - Hierarchical structure (parent, siblings, children)
            - Attribute details for each indicator value

        :param request: The HTTP request object containing query parameters.
        :type request: rest_framework.request.Request
        :param str slug: The unique slug identifier of the dashboard.
        :param str geom_id: The geometry ID or concept UUID of the entity.
        :return:
            A JSON response containing indicator and related table data for
            the specified geometry and its related entities.
        :rtype: rest_framework.response.Response
        """
        dashboard = get_object_or_404(Dashboard, slug=slug)
        reference_layer = self.return_reference_view()

        entities = Entity.objects.filter(
            Q(geom_id=geom_id) | Q(concept_uuid=geom_id)
        )
        entity = entities.first()
        if not entity:
            return HttpResponseBadRequest(
                f'Entity with geom_id: {geom_id} does not exist.'
            )

        # Collect all entity IDs for bulk value fetching
        entities_id = list(entities.values_list('id', flat=True))

        use_parent = request.GET.get('parent', False)
        use_siblings = request.GET.get('siblings', False)
        use_children = request.GET.get('children', False)

        # Fetch relationships once and reuse throughout
        parent = None
        if use_parent:
            parent = entity.parent
            if parent:
                entities_id.append(parent.id)
        siblings = None
        if use_siblings:
            siblings = entity.siblings
            entities_id.extend(siblings.values_list('id', flat=True))

        children = None
        if use_children:
            children = entity.children
            entities_id.extend(children.values_list('id', flat=True))

        # INDICATORS DATA
        # Check permissions per indicator and collect allowed ones in one pass
        allowed_indicators = {}  # {indicator_id: indicator_key}
        dashboard_indicators = dashboard.dashboardindicator_set.all()
        ids = request.GET.get('ids', None)
        if ids:
            dashboard_indicators = dashboard_indicators.filter(
                object_id__in=ids.split(',')
            )
        for dashboard_indicator in dashboard_indicators:
            indicator = dashboard_indicator.object
            try:
                reference_layer = self.check_permission(
                    request.user, indicator
                )
                indicator_key = (
                    indicator.shortcode
                    if indicator.shortcode else indicator.id
                )
                allowed_indicators[indicator.id] = indicator_key
            except ResourcePermissionDenied:
                pass

        indicators = {}
        if allowed_indicators:
            # Single query for
            # all indicator values across all allowed indicators
            all_values = list(
                IndicatorValueWithGeo.objects.filter(
                    indicator_id__in=list(allowed_indicators.keys()),
                    entity_id__in=entities_id
                ).order_by('concept_uuid', 'geom_id', '-date')
            )
            # Batch-fetch attributes to avoid N+1 per value
            attr_map = {
                iv.id: iv.extra_value or {}
                for iv in IndicatorValue.objects.filter(
                    id__in=[v.id for v in all_values]
                ).only('id', 'extra_value')
            }
            for value in all_values:
                key = value.concept_uuid
                if key not in indicators:
                    indicators[key] = {}
                indicator_key = allowed_indicators[value.indicator_id]
                if indicator_key not in indicators[key]:
                    indicators[key][indicator_key] = []
                indicators[key][indicator_key].append({
                    'value': value.value,
                    'time': datetime.combine(
                        value.date, datetime.min.time(),
                        tzinfo=pytz.timezone(settings.TIME_ZONE)
                    ).isoformat(),
                    'attributes': attr_map.get(value.id, {})
                })

        # RELATED TABLES DATA
        related_tables = {}
        rt_config = json.loads(request.GET.get('rtconfigs', '{}'))
        # Fetch once — same result for every related table
        country_geom_ids = list(
            reference_layer.countries.values_list('geom_id', flat=True)
        )
        dashboard_related = dashboard.dashboardrelatedtable_set.all()
        ids = request.GET.get('ids', None)
        if ids:
            dashboard_related = dashboard_related.filter(
                object_id__in=ids.split(',')
            )
        for dashboard_related in dashboard_related:
            related_table = dashboard_related.object
            date_field = None
            date_format = None
            try:
                date_field = rt_config[f'{related_table.id}']['date_field']
                date_format = rt_config[f'{related_table.id}']['date_format']
            except KeyError:
                pass
            values, has_next = related_table.data_with_query(
                country_geom_ids=country_geom_ids,
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

        admin_boundary = EntitySerializer(entity).data
        # Construct context
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
                admin_boundary['parent']['related_tables'] = \
                    related_tables[parent.concept_uuid]
            except KeyError:
                admin_boundary['parent']['related_tables'] = {}

        if children:
            # For children
            admin_boundary['children'] = EntitySerializer(
                children, many=True
            ).data
            for child in admin_boundary['children']:
                try:
                    child['indicators'] = indicators[child['concept_uuid']]
                except KeyError:
                    child['indicators'] = {}

                try:
                    child['related_tables'] = related_tables[
                        child['concept_uuid']]
                except KeyError:
                    child['related_tables'] = {}

        if siblings:
            # For siblings
            admin_boundary['siblings'] = EntitySerializer(
                siblings, many=True
            ).data
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
