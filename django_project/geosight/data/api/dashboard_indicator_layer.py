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

from django.http import Http404
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView

from geosight.data.models.dashboard import (
    Dashboard, DashboardIndicatorLayer
)
from geosight.data.serializer.dashboard_indicator_layer import (
    DashboardIndicatorLayerSerializer
)


class DashboardIndicatorLayerAPI(APIView):
    """Return Dashboard Indicator Layer."""

    def get(self, request, slug, pk):
        """Return Dashboard Bookmark list."""
        dashboard = get_object_or_404(Dashboard, slug=slug)
        try:
            layer = dashboard.dashboardindicatorlayer_set.get(pk=pk)
            return Response(DashboardIndicatorLayerSerializer(layer).data)
        except DashboardIndicatorLayer.DoesNotExist:
            raise Http404('No indicator layer matches the given query.')
