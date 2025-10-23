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

from geosight.data.api.v1.utils import update_request_reference_dataset


class IndicatorValueApiUtilities:
    """Indicator value api utilities."""

    def _set_request(self):  # noqa DOC110, DOC103
        """
        Set request query parameters from POST data.

        Copies data from the POST body (`self.request.data`) into
        the GET query parameters (`self.request.GET`), allowing
        uniform access to parameters regardless of HTTP method.

        :return: None
        """
        update_request_reference_dataset(self.request, 'country_geom_id__in')
        data = self.request.data.copy()
        for key, value in data.items():
            self.request.GET[key] = value

    def get_queryset(self):
        """
        Return the base queryset for this view.

        This method must be overridden in subclasses to provide the set of
        objects that the view will operate on. By default, it raises
        :class:`NotImplementedError` to enforce explicit definition.

        :raises NotImplementedError:
            If the method is not overridden in a subclass.
        """
        raise NotImplementedError()

    @swagger_auto_schema(auto_schema=None)
    @action(detail=False, methods=['get'])
    def ids(self, request):
        """
        Retrieve the list of record IDs.

        This endpoint returns the primary key (``id``) values of all objects
        in the queryset.

        :param request: The HTTP request object.
        :type request: rest_framework.request.Request

        :return: A list of integer IDs.
        :rtype: rest_framework.response.Response

        :status 200: Successfully returns the list of IDs.
        """
        return Response(
            self.get_queryset().values_list('id', flat=True)
        )

    @swagger_auto_schema(auto_schema=None)
    @action(detail=False, methods=['get'])
    def values_string(self, request):
        """
        Retrieve the distinct list of string values.

        This endpoint returns a sorted list of unique ``value_str`` entries
        from the queryset where ``value_str`` is not null.

        :param request: The HTTP request object.
        :type request: rest_framework.request.Request

        :return: A list of distinct string values.
        :rtype: rest_framework.response.Response

        :status 200: Successfully returns the list of string values.
        """
        return Response(
            self.get_queryset().filter(value_str__isnull=False).values_list(
                'value_str', flat=True
            ).distinct().order_by('value_str')
        )

    @swagger_auto_schema(auto_schema=None)
    @action(detail=False, methods=['get'])
    def values(self, request):
        """
        Retrieve raw values of data with optional frequency-based grouping.

        By default, the response includes the fields:
        ``date``, ``value``, ``value_str``, ``entity_id``,
        and ``indicator_id``.
        The result set can be customized by passing the ``fields``
        query parameter,
        and can be grouped by ``daily``, ``monthly``, or ``yearly`` frequency.

        :param request: The HTTP request object.
        :type request: rest_framework.request.Request

        :query string fields:
            Comma-separated list of fields to include in the response.
            Defaults to ``date,value,value_str,entity_id,indicator_id``.
        :query string frequency:
            Optional frequency granularity for grouping.
            Valid values are ``daily``, ``monthly``, or ``yearly``.
        :query string sort:
            Comma-separated list of fields to sort by.
            Defaults to ``-date`` if not provided.

        :return:
            A list of dictionaries containing the requested fields, optionally
            grouped and aggregated by frequency.
        :rtype: rest_framework.response.Response

        :status 200: Successfully returns the data values.
        :status 400: If an invalid ``frequency`` is provided.
        """
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
        """
        Retrieve statistical aggregations of the data.

        This endpoint computes one or more aggregate values
        (``min``, ``max``, ``avg``)
        over the queryset returned by :meth:`get_queryset`.

        :param request: The HTTP request object.
        :type request: rest_framework.request.Request

        :query string keys:
            Comma-separated list of aggregation functions to apply.
            Valid values are ``min``, ``max``, and ``avg``.
            Defaults to ``min,max,avg``.

        :return: A JSON response containing the requested statistics.
        :rtype: rest_framework.response.Response

        :status 200: Successfully returns the requested aggregations.
        :status 400: If ``keys`` is missing, empty, or contains invalid values.
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
