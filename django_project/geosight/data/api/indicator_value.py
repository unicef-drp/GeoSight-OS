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

from django.http import HttpResponseBadRequest, HttpResponseNotFound
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.permissions import AdminAuthenticationPermission
from geosight.data.models.indicator import (
    Indicator, IndicatorValue, IndicatorValueRejectedError
)
from geosight.data.serializer.indicator import (
    IndicatorValueDetailSerializer

)
from geosight.data.serializer.indicator_value import IndicatorValueSerializer
from geosight.georepo.models import ReferenceLayerIndicator
from geosight.permission.access import (
    delete_permission_resource, read_permission_resource,
    ResourcePermissionDenied
)


class IndicatorValuesByGeometry(APIView):
    """Return Scenario value for the specific geometry for all date."""

    permission_classes = (IsAuthenticated, AdminAuthenticationPermission)

    def get(self, request, pk, geometry_code):
        """Return values of the indicator.

        :param pk: pk of the indicator
        :param geometry_code: the geometry code
        :return:
        """
        indicator = get_object_or_404(Indicator, pk=pk)
        values = indicator.indicatorvalue_set.filter(
            geom_id=geometry_code
        ).order_by('-date')
        return Response(
            IndicatorValueSerializer(
                values,
                fields=['date', 'value', 'value_str'],
                context={'user': request.user},
                many=True
            ).data
        )

    def post(self, request, pk, geometry_code):
        """Return values of the indicator.

        :param pk: pk of the indicator
        :param geometry_code: the geometry code
        :return:
        """
        indicator = get_object_or_404(Indicator, pk=pk)
        reference_layer = request.POST.get('reference_layer', None)
        admin_level = request.POST.get('admin_level', None)
        indicator.able_to_write_data(self.request.user)
        try:
            value = float(request.POST['value'])
            indicator.save_value(
                request.POST['date'], geometry_code, value,
                reference_layer=reference_layer,
                admin_level=admin_level
            )
            return Response('OK')
        except ValueError:
            return HttpResponseBadRequest('Value is not a number')
        except IndicatorValueRejectedError as e:
            return HttpResponseBadRequest(f'{e}')


class IndicatorValueDetail(APIView):
    """Return Scenario value for the specific geometry for all date."""

    permission_classes = (IsAuthenticated,)

    def get(self, request, pk, value_id):
        """Return attributes of the indicator.

        :param pk: pk of the indicator
        :param value_id: the id of value
        :return:
        """
        indicator = get_object_or_404(Indicator, pk=pk)
        try:
            indicator_value = indicator.indicatorvalue_set.get(pk=value_id)
            try:
                dataset = ReferenceLayerIndicator.objects.get(
                    indicator=indicator,
                    reference_layer=indicator_value.reference_layer
                )
                read_permission_resource(dataset, request.user)
            except ReferenceLayerIndicator.DoesNotExist:
                raise ResourcePermissionDenied
            return Response(
                IndicatorValueDetailSerializer(indicator_value).data
            )
        except IndicatorValue.DoesNotExist:
            return HttpResponseNotFound('Not found')

    def delete(self, request, pk, value_id):
        """Delete an value."""
        indicator = get_object_or_404(Indicator, pk=pk)
        try:
            indicator_value = indicator.indicatorvalue_set.get(pk=value_id)
            delete_permission_resource(indicator, request.user)
            indicator_value.delete()
            return Response('Deleted')
        except IndicatorValue.DoesNotExist:
            return HttpResponseNotFound('Not found')
