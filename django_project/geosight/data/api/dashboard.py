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

from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.cache import VersionCache
from core.models.preferences import SitePreferences
from geosight.data.models.basemap_layer import BasemapLayer
from geosight.data.models.context_layer import ContextLayer
from geosight.data.models.dashboard import Dashboard
from geosight.data.models.indicator import Indicator
from geosight.data.models.related_table import RelatedTable
from geosight.data.serializer.basemap_layer import BasemapLayerSerializer
from geosight.data.serializer.dashboard import (
    DashboardBasicSerializer, DashboardSerializer
)
from geosight.permission.access import (
    delete_permission_resource, read_permission_resource
)


class DashboardListAPI(APIView):
    """Return DashboardLayer list."""

    def get(self, request):
        """Return DashboardLayer list."""
        return Response(
            DashboardBasicSerializer(
                Dashboard.permissions.list(request.user).order_by('name'),
                many=True, context={'user': request.user}
            ).data
        )

    def delete(self, request):
        """Delete objects."""
        ids = json.loads(request.data['ids'])
        for obj in Dashboard.permissions.delete(request.user).filter(
                slug__in=ids):
            obj.delete()
        return Response('Deleted')


CREATE_SLUG = ':CREATE'


class DashboardDetail(APIView):
    """Return all dashboard data."""

    permission_classes = (IsAuthenticated,)

    def delete(self, request, slug):
        """Delete an basemap."""
        dashboard = get_object_or_404(Dashboard, slug=slug)
        delete_permission_resource(dashboard, request.user)
        dashboard.delete()
        return Response('Deleted')


class DashboardData(APIView):
    """Return all dashboard data."""

    def get(self, request, slug):
        """Return all context analysis data."""
        if slug != CREATE_SLUG:
            dashboard = get_object_or_404(Dashboard, slug=slug)
            read_permission_resource(dashboard, request.user)

            # Cache version
            cache = VersionCache(
                key=request.get_full_path(), version=dashboard.version
            )
            cache_data = cache.get()
            if cache_data:
                data = cache_data
            else:
                data = DashboardSerializer(
                    dashboard, context={'user': request.user}).data
                cache.set(data)

        else:
            dashboard = Dashboard()
            data = DashboardSerializer(
                dashboard, context={'user': request.user}).data

            # Put the default basemap
            preferences = SitePreferences.preferences()
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
                    resource['permission'] = row['model'].objects.get(
                        id=resource['id']
                    ).permission.all_permission(request.user)
                except RelatedTable.DoesNotExist:
                    pass
        return Response(data)
