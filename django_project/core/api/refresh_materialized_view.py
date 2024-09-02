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
__date__ = '25/07/2023'
__copyright__ = ('Copyright 2023, Unicef')

from rest_framework.response import Response
from rest_framework.views import APIView

from core.permissions import AdminAuthenticationPermission
from geosight.data.models.indicator.indicator_value import (
    IndicatorValueWithGeo
)


class RefreshMaterializedViewApi(APIView):
    """Refresh materialized view API."""

    permission_classes = (AdminAuthenticationPermission,)

    def post(self, request, *args, **kwargs):
        """Get access request list."""
        view = request.data['view']
        if view == IndicatorValueWithGeo._meta.db_table:
            IndicatorValueWithGeo.refresh_materialized_views()
        return Response(status=201)
