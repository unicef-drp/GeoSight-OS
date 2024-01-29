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

from django.http import HttpResponseBadRequest
from django.shortcuts import get_object_or_404
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.pagination import Pagination
from geosight.data.api.dashboard_indicator_value import (
    _DashboardIndicatorValuesAPI
)
from geosight.data.models.indicator import Indicator
from geosight.data.serializer.indicator import (
    IndicatorValueWithGeoDateSerializer, IndicatorAdminListSerializer,
    IndicatorSerializer, IndicatorBasicListSerializer
)
from geosight.georepo.models.reference_layer import ReferenceLayerView
from geosight.permission.access import (
    read_permission_resource, delete_permission_resource
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
        return Response(
            IndicatorSerializer(
                indicator,
                context={'user': request.user}
            ).data
        )

    def delete(self, request, pk):
        """Delete an indicator."""
        indicator = get_object_or_404(Indicator, pk=pk)
        delete_permission_resource(indicator, request.user)
        indicator.delete()
        return Response('Deleted')


class IndicatorValuesAPI(
    _DashboardIndicatorValuesAPI, ListAPIView
):
    """API for Values of indicator."""

    permission_classes = (IsAuthenticated,)
    pagination_class = Pagination
    serializer_class = IndicatorValueWithGeoDateSerializer

    def get_queryset(self):
        """Return queryset of API."""
        pk = self.kwargs['pk']
        indicator = get_object_or_404(Indicator, pk=pk)
        min_time, max_time = self.return_parameters(self.request)
        try:
            reference_layer = ReferenceLayerView.objects.get(
                identifier=self.request.GET.get('reference_layer_uuid', '')
            )
        except ReferenceLayerView.DoesNotExist:
            reference_layer = ReferenceLayerView()

        return indicator.values(
            date_data=max_time,
            min_date_data=min_time,
            admin_level=self.request.GET.get('admin_level', None),
            reference_layer=reference_layer
        )

    def get(self, request, **kwargs):
        """Return Values."""
        queryset = self.filter_queryset(self.get_queryset())

        # Get list data and save it to cache
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            assert self.paginator is not None
            response = self.paginator.get_paginated_response_data(
                serializer.data
            )
            return Response(response)

        serializer = self.get_serializer(queryset, many=True)
        response = serializer.data
        return Response(response)


class IndicatorMetadataAPI(APIView):
    """API for Values of indicator."""

    def get(self, request, pk, **kwargs):
        """Return Values."""
        indicator = get_object_or_404(Indicator, pk=pk)
        return Response(
            indicator.metadata(
                self.request.GET.get('reference_layer_uuid', '')
            )
        )


class SearchSimilarityIndicatorAPI(APIView):
    """API for checking list of similarity."""

    permission_classes = (IsAuthenticated,)

    def post(self, request, **kwargs):
        """Return Values."""
        data = request.data
        try:
            return Response(
                Indicator.search(
                    name=data.get('name', ''),
                    description=data.get('description', '')
                )
            )
        except Exception as e:
            return HttpResponseBadRequest(f'{e}')
