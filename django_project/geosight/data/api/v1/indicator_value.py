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
__date__ = '05/03/2025'
__copyright__ = ('Copyright 2025, Unicef')

from django.db.models import Min, Max, Avg
from django.db.models.functions import ExtractDay, ExtractMonth, ExtractYear
from django.http import HttpResponseBadRequest
from drf_yasg.utils import swagger_auto_schema
from rest_framework.decorators import action
from rest_framework.response import Response


class IndicatorValueApiUtilities:
    """Indicator value api utilities."""

    def get_queryset(self):
        """Queryset."""
        raise NotImplementedError()

    @swagger_auto_schema(auto_schema=None)
    @action(detail=False, methods=['get'])
    def ids(self, request):
        """Get ids of data."""
        return Response(
            self.get_queryset().values_list('id', flat=True)
        )

    @swagger_auto_schema(auto_schema=None)
    @action(detail=False, methods=['get'])
    def values_string(self, request):
        """Get value list of string of data."""
        return Response(
            self.get_queryset().filter(value_str__isnull=False).values_list(
                'value_str', flat=True
            ).distinct().order_by('value_str')
        )

    @swagger_auto_schema(auto_schema=None)
    @action(detail=False, methods=['get'])
    def values(self, request):
        """Get values of data."""
        query = self.get_queryset()

        fields = request.GET.get(
            'fields',
            'date, value, value_str, entity_id, indicator_id'
        ).replace(' ', '').split(',')

        # If it has frequency
        frequency = request.GET.get('frequency', None)
        if frequency:
            distinct = ['geom_id', 'entity_id', 'indicator_id']
            if frequency.lower() == 'daily':
                distinct.append('year')
                distinct.append('month')
                distinct.append('day')
                query = query.annotate(
                    day=ExtractDay('date'),
                    month=ExtractMonth('date'),
                    year=ExtractYear('date')
                )
            elif frequency.lower() == 'monthly':
                distinct.append('year')
                distinct.append('month')
                query = query.annotate(
                    month=ExtractMonth('date'),
                    year=ExtractYear('date')
                )
            elif frequency.lower() == 'yearly':
                distinct.append('year')
                query = query.annotate(
                    year=ExtractYear('date')
                )
            else:
                return HttpResponseBadRequest(
                    f'frequency {frequency} is not recognized. '
                    f'frequency: daily, monthly, yearly'
                )

            # Request
            order_by = ['-' + field for field in distinct]
            order_by.append('-date')
            query = query.order_by(
                *[field for field in order_by]
            ).distinct(*distinct).values(*distinct + fields)
        else:
            sort = ['-date']
            if request.GET.get('sort'):
                sort = request.GET.get('sort').split(',')
            query = query.order_by(*sort).values(*fields)
        return Response(query)

    @swagger_auto_schema(auto_schema=None)
    @action(detail=False, methods=['get'])
    def statistic(self, request):
        """Get statistic of data.

        It returns {min, max, avg}
        """
        statistic_keys = ['min', 'max', 'avg']
        keys = request.GET.get(
            'keys', ','.join(statistic_keys)
        ).replace(' ', '').split(',')
        if not keys:
            return HttpResponseBadRequest(
                f'keys is required. keys:{statistic_keys}'
            )

        query = self.get_queryset()
        aggregation_dict = {}
        for key in keys:
            key = key.lower()
            if key not in statistic_keys:
                return HttpResponseBadRequest(
                    f'{key} is not recognized. keys:{statistic_keys}'
                )

            # Update query
            if key == 'min':
                aggregation_dict['min'] = Min('value')
            elif key == 'max':
                aggregation_dict['max'] = Max('value')
            elif key == 'avg':
                aggregation_dict['avg'] = Avg('value')

        if not aggregation_dict.keys():
            return HttpResponseBadRequest('No aggregation found')

        return Response(query.aggregate(**aggregation_dict))
