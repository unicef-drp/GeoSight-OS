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

from django.db import transaction
from django.http import HttpResponseBadRequest, HttpResponseNotFound
from django.shortcuts import get_object_or_404
from rest_framework.authentication import (
    SessionAuthentication, BasicAuthentication
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.permissions import AdminAuthenticationPermission
from geosight.data.models.indicator import (
    Indicator, IndicatorValue, IndicatorValueRejectedError
)
from geosight.data.models.indicator.indicator_value import (
    IndicatorValueWithGeo
)
from geosight.data.serializer.indicator import (
    IndicatorValueDetailSerializer

)
from geosight.data.serializer.indicator_value import IndicatorValueSerializer
from geosight.georepo.models import ReferenceLayerIndicator
from geosight.permission.access import (
    delete_permission_resource, read_permission_resource,
    edit_permission_resource,
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


class IndicatorValueListAPI(APIView):
    """API for Values of indicator."""

    authentication_classes = [SessionAuthentication, BasicAuthentication]
    permission_classes = (IsAuthenticated,)

    def get(self, request, pk, **kwargs):
        """Return Values."""
        indicator = get_object_or_404(Indicator, pk=pk)
        read_permission_resource(indicator, request.user)

        return Response(
            IndicatorValueSerializer(
                IndicatorValueWithGeo.objects.filter(
                    indicator_id=indicator.id
                ),
                many=True,
                context={'user': request.user}
            ).data
        )

    def post(self, request, pk):
        """Save value for specific date."""
        indicator = get_object_or_404(Indicator, pk=pk)
        edit_permission_resource(indicator, request.user)
        data = request.data
        ids = []
        if not isinstance(data, list):
            return HttpResponseBadRequest('Payload should be in array')
        try:
            with transaction.atomic():
                for record in data:
                    # Validate the data
                    try:
                        date_time = datetime.fromtimestamp(record['timestamp'])
                    except TypeError:
                        raise ValueError('Timestamp is not integer')
                    except ValueError:
                        raise ValueError('Timestamp is not a date')

                    # extra data needs to be dictionary
                    extra_data = record.get('extra_data', None)
                    if extra_data:
                        try:
                            extra_data.keys()
                        except AttributeError:
                            raise ValueError('The extra_data needs to be json')

                    # Check if value already exist
                    geom_id = record['geom_id']
                    try:
                        indicator.indicatorvalue_set.get(
                            date=date_time,
                            geom_id=geom_id
                        )
                        raise ValueError(
                            f'The value for {date_time} in {geom_id} '
                            f'already exist'
                        )
                    except IndicatorValue.DoesNotExist:
                        value = indicator.save_value(
                            date=date_time,
                            geom_id=geom_id,
                            reference_layer=record['reference_layer'],
                            admin_level=record['admin_level'],
                            geom_id_type=record['geom_id_type'],
                            extras=extra_data,
                            value=record['value']
                        )
                        ids.append(value.id)

            # TODO:
            #  Response with the no content
            return Response(
                IndicatorValueSerializer(
                    IndicatorValueWithGeo.objects.filter(
                        indicator_id=indicator.id
                    ),
                    many=True,
                    context={'user': request.user}
                ).data
            )
        except ValueError as e:
            return HttpResponseBadRequest(f'{e}')
        except KeyError as e:
            return HttpResponseBadRequest(f'{e} is required')
        except IndicatorValueRejectedError as e:
            return HttpResponseBadRequest(f'{e}')

    def delete(self, request, pk):
        """Delete an value."""
        indicator = get_object_or_404(Indicator, pk=pk)
        delete_permission_resource(indicator, request.user)
        ids = request.POST.get('ids', None)
        if not ids:
            return HttpResponseNotFound('ids is needed')
        ids = json.loads(ids)
        try:
            values = indicator.indicatorvalue_set.filter(pk__in=ids)
            values.delete()
            return Response('Deleted')
        except IndicatorValue.DoesNotExist:
            return HttpResponseNotFound('Not found')
