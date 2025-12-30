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
import uuid
from django.http import HttpResponseBadRequest
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.cache import VersionCache
from core.models.preferences import SitePreferences
from frontend.views.admin.dashboard.create import DashboardCreateViewBase
from geosight.data.models.basemap_layer import BasemapLayer
from geosight.data.models.context_layer import ContextLayer
from geosight.data.models.dashboard import (
    Dashboard, DashboardIndicator, DashboardIndicatorLayer
)
from geosight.data.models.indicator import Indicator
from geosight.data.models.related_table import RelatedTable
from geosight.data.serializer.basemap_layer import BasemapLayerSerializer
from geosight.data.serializer.dashboard import (
    DashboardBasicSerializer, DashboardSerializer
)
from geosight.georepo.models.entity import Entity
from geosight.georepo.models.reference_layer import ReferenceLayerView
from geosight.permission.access import (
    delete_permission_resource, read_permission_resource
)

CREATE_SLUG = ':CREATE'


class DashboardListAPI(APIView):
    """
    API view for listing and deleting dashboards.

    Provides:

    * **GET** – Return a list of dashboards accessible to the user.
    * **DELETE** – Delete dashboards by their slugs.
    """

    def get(self, request):
        """
        Retrieve the list of dashboards.

        :param request: HTTP request object.
        :type request: rest_framework.request.Request
        :return: A list of dashboards serialized using
            :class:`DashboardBasicSerializer`.
        :rtype: rest_framework.response.Response
        """
        return Response(
            DashboardBasicSerializer(
                Dashboard.permissions.list(request.user).order_by('name'),
                many=True, context={'user': request.user}
            ).data
        )

    def delete(self, request):
        """
        Delete dashboards by their slugs.

        :param request: HTTP request containing a JSON list of dashboard slugs
            in ``ids``.
        :type request: rest_framework.request.Request
        :return: Confirmation message.
        :rtype: rest_framework.response.Response
        """
        ids = json.loads(request.data['ids'])
        for obj in Dashboard.permissions.delete(request.user).filter(
                slug__in=ids):
            obj.delete()
        return Response('Deleted')


class DashboardDetail(APIView):
    """API view for retrieving or deleting a single dashboard."""

    permission_classes = (IsAuthenticated,)

    def delete(self, request, slug):
        """
        Delete a dashboard.

        :param request: HTTP request object.
        :type request: rest_framework.request.Request
        :param slug: Unique identifier of the dashboard.
        :type slug: str
        :return: Confirmation message.
        :rtype: rest_framework.response.Response
        """
        dashboard = get_object_or_404(Dashboard, slug=slug)
        delete_permission_resource(dashboard, request.user)
        dashboard.delete()
        return Response('Deleted')


class DashboardDuplicate(APIView, DashboardCreateViewBase):
    """
    API view for duplicating a dashboard.

    Creates a new dashboard by cloning an existing one, ensuring unique
    names and slugs.
    """

    permission_classes = (IsAuthenticated,)

    def update_name(self, name, counter=1):
        """
        Generate a unique dashboard name.

        :param name: Original name.
        :type name: str
        :param counter: Recursion counter for uniqueness.
        :type counter: int
        :return: A unique dashboard name.
        :rtype: str
        """
        new_name = f'{name} {counter}'
        try:
            Dashboard.objects.get(name=new_name)
            return self.update_name(name, counter + 1)
        except Dashboard.DoesNotExist:
            return new_name

    def update_slug(self, slug, counter=1):
        """
        Generate a unique dashboard slug.

        :param slug: Original slug.
        :type slug: str
        :param counter: Recursion counter for uniqueness.
        :type counter: int
        :return: A unique dashboard slug.
        :rtype: str
        """
        new_slug = f'{slug}-{counter}'
        try:
            Dashboard.objects.get(slug=new_slug)
            return self.update_slug(slug, counter + 1)
        except Dashboard.DoesNotExist:
            return new_slug

    def post(self, request, slug):
        """
        Duplicate a dashboard.

        :param request: HTTP request object.
        :type request: rest_framework.request.Request
        :param slug: Slug of the dashboard to duplicate.
        :type slug: str
        :return: The newly created dashboard.
        :rtype: rest_framework.response.Response
        """
        dashboard = get_object_or_404(Dashboard, slug=slug)
        delete_permission_resource(dashboard, request.user)

        data = DashboardSerializer(
            dashboard, context={'user': request.user}
        ).data
        data['name'] = self.update_name(name=data['name'])
        data['slug'] = self.update_slug(slug=data['slug'])
        data['geoField'] = data['geo_field']
        data['creator'] = request.user
        try:
            data['reference_layer'] = data['reference_layer']['identifier']
        except KeyError:
            pass
        data['data'] = data
        data['origin_id'] = dashboard.id
        try:
            del data['featured']
        except KeyError:
            pass
        return self.save(data, request.user, request.FILES)


class DashboardData(APIView):
    """
    API view for retrieving dashboard data.

    Handles:

    * Returning cached dashboard data when available.
    * Creating a temporary dashboard for `:CREATE` slug with optional defaults.
    """

    def get(self, request, slug):
        """
        Retrieve dashboard data.

        If ``slug`` equals ``:CREATE``, returns a new dashboard object with
        defaults applied. Otherwise, retrieves the existing dashboard and
        caches the serialized response.

        :param request: HTTP request object.
        :type request: rest_framework.request.Request
        :param slug: Slug of the dashboard or ``:CREATE`` for new dashboards.
        :type slug: str
        :return: Dashboard data serialized with :class:`DashboardSerializer`.
        :rtype: rest_framework.response.Response
        """
        if slug != CREATE_SLUG:
            dashboard = get_object_or_404(Dashboard, slug=slug)
            read_permission_resource(dashboard, request.user)

            # Cache version
            cache = VersionCache(
                key=request.get_full_path(),
                version=dashboard.version,
                request=request,
            )
            cache_data = cache.get()
            if cache_data:
                data = cache_data
            else:
                data = DashboardSerializer(
                    dashboard, context={'user': request.user}).data
                cache.set(data)

        else:
            preferences = SitePreferences.preferences()
            dashboard = Dashboard()
            dashboard.filters_being_hidden = True

            # Get default by dataset
            default_dataset = None
            if preferences.georepo_default_view:
                default_dataset = preferences.georepo_default_view.identifier

            dataset = request.GET.get('dataset', default_dataset)
            if dataset:
                try:
                    view = ReferenceLayerView.objects.get(
                        identifier=dataset
                    )
                except ReferenceLayerView.DoesNotExist:
                    return HttpResponseBadRequest(
                        'Dataset is not ready, please refresh'
                    )
                dashboard.reference_layer = view

            # Get default by dataset_id
            dataset_id = request.GET.get('dataset_id', None)
            if dataset_id:
                try:
                    view = ReferenceLayerView.objects.get(id=dataset_id)
                    dashboard.reference_layer = view
                except ReferenceLayerView.DoesNotExist:
                    pass

            # Get default by entity_id
            entity_ids = request.GET.get('entity_ids', None)
            if entity_ids:
                entity_ids = entity_ids.split(',')
                entity = Entity.objects.get(id=entity_ids[0])
                dashboard.reference_layer = (
                    ReferenceLayerView.get_priority_view_by_country(
                        entity, tag=None if len(entity_ids) == 1 else 'dataset'
                    )
                )

            indicators = request.GET.get('indicators', None)

            dashboard_indicators = []
            dashboard_indicator_layers = []
            indicator_layers_structure_children = []
            if indicators:
                for idx, indicator in enumerate(
                        Indicator.objects.filter(id__in=indicators.split(','))
                ):
                    dashboard_indicators.append(
                        DashboardIndicator(
                            object=indicator
                        )
                    )
                    indicator_layers = DashboardIndicatorLayer(
                        id=idx + 1,
                        dashboard=dashboard,
                        name=indicator.name
                    )
                    indicator_layers.indicators = [indicator]
                    dashboard_indicator_layers.append(
                        indicator_layers
                    )
                    indicator_layers_structure_children.append(idx + 1)

            data = DashboardSerializer(
                dashboard,
                context={
                    'user': request.user,
                    'dashboard_indicators': dashboard_indicators,
                    'dashboard_indicator_layers': dashboard_indicator_layers,
                }
            ).data
            if indicator_layers_structure_children:
                data['indicator_layers_structure'] = {
                    "id": str(uuid.uuid4()),
                    "group": "",
                    "children": indicator_layers_structure_children
                }

            # Put the default basemap
            if preferences.default_basemap:
                try:
                    default_basemap = BasemapLayer.objects.get(
                        id=preferences.default_basemap
                    )
                    if default_basemap.permission.has_list_perm(request.user):
                        data['basemaps_layers_structure'] = {
                            "id": str(uuid.uuid4()),
                            "group": "",
                            "children": [default_basemap.id]
                        }
                        basemap = BasemapLayerSerializer(
                            default_basemap,
                            context={'user': request.user}
                        ).data
                        basemap['visible_by_default'] = True
                        data['basemaps_layers'] = [basemap]
                except BasemapLayer.DoesNotExist:
                    pass

        # Return permissions for the resources
        for row in [
            {'key': 'indicators', 'model': Indicator},
            {'key': 'context_layers', 'model': ContextLayer},
            {'key': 'related_tables', 'model': RelatedTable},
        ]:
            for resource in data[row['key']]:
                try:
                    obj = row['model'].objects.get(id=resource['id'])
                    resource['permission'] = obj.permission.all_permission(
                        request.user
                    )
                    try:
                        resource['version'] = obj.version
                    except AttributeError:
                        pass
                except (
                        RelatedTable.DoesNotExist,
                        Indicator.DoesNotExist,
                        ContextLayer.DoesNotExist
                ):
                    pass

        return Response(data)
