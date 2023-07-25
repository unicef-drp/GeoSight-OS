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

from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from geosight.data.models.indicator import Indicator
from geosight.data.serializer.indicator import (
    IndicatorAdminListSerializer, IndicatorSerializer,
    IndicatorBasicListSerializer
)
from geosight.permission.access import (
    read_permission_resource,
    delete_permission_resource
)


class IndicatorListAPI(APIView):
    """API for list of indicator."""

    def get(self, request):
        """Return Indicatorslist."""
        return Response(
            IndicatorSerializer(
                Indicator.permissions.list(request.user).filter(
                    group__isnull=False).order_by('group__name', 'name'),
                many=True, context={'user': request.user},
                fields=request.GET.get('fields', []),
                exclude=['last_update']
            ).data
        )


class IndicatorAdminListAPI(APIView):
    """Return list of indicator in admin data."""

    def get(self, request):
        """Return Indicatorslist."""
        return Response(
            IndicatorAdminListSerializer(
                Indicator.permissions.list(request.user).filter(
                    group__isnull=False).order_by('group__name', 'name'),
                many=True, context={'user': request.user}
            ).data
        )

    def delete(self, request):
        """Delete objects."""
        ids = json.loads(request.data['ids'])
        for obj in Indicator.permissions.delete(request.user).filter(
                id__in=ids):
            obj.delete()
        return Response('Deleted')


class IndicatorBasicListAPI(APIView):
    """Return list of indicator in basic data."""

    def get(self, request):
        """Return Indicatorslist."""
        return Response(
            IndicatorBasicListSerializer(
                Indicator.permissions.list(request.user).filter(
                    group__isnull=False).order_by('group__name', 'name'),
                many=True, context={'user': request.user}
            ).data
        )


class IndicatorDetailAPI(APIView):
    """API for detail of indicator."""

    permission_classes = (IsAuthenticated,)

    def get(self, request, pk):
        """Delete an indicator."""
        indicator = get_object_or_404(Indicator, pk=pk)
        read_permission_resource(indicator, request.user)
        return Response('Deleted')

    def delete(self, request, pk):
        """Delete an indicator."""
        indicator = get_object_or_404(Indicator, pk=pk)
        delete_permission_resource(indicator, request.user)
        indicator.delete()
        return Response('Deleted')


class IndicatorValuesAPI(APIView):
    """API for Values of indicator."""

    permission_classes = (IsAuthenticated,)

    def get(self, request, pk, **kwargs):
        """Return Values."""
        indicator = get_object_or_404(Indicator, pk=pk)
        return Response(indicator.values(datetime.now()))
