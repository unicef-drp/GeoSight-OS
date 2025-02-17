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
__date__ = '29/11/2023'
__copyright__ = ('Copyright 2023, Unicef')

import json

from django.core.exceptions import SuspiciousOperation
from django.db.models import Min, Max, Avg
from django.db.models.functions import ExtractDay, ExtractMonth, ExtractYear
from django.http import HttpResponseBadRequest
from drf_yasg.utils import swagger_auto_schema
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from core.api_utils import common_api_params, ApiTag, ApiParams
from core.utils import string_is_true
from geosight.data.api.v1.base import non_filtered_keys
from geosight.data.models.indicator import (
    Indicator, IndicatorValue, IndicatorValueRejectedError
)
from geosight.data.serializer.indicator import (
    IndicatorValueSerializer, IndicatorValueWithPermissionSerializer
)
from .base import BaseDataApiList


class BaseDataBrowserApiList(BaseDataApiList):
    """Return Data List API List."""

    filter_query_exclude = non_filtered_keys + [
        'group_admin_level', 'detail', 'frequency'
    ]

    def get_serializer(self, *args, **kwargs):
        """Return the serializer instance."""
        serializer_class = self.get_serializer_class()
        kwargs.setdefault('context', self.get_serializer_context())

        if self.action in ['list']:
            fields = self.request.GET.get('fields')
            if not fields:
                kwargs['exclude'] = ['creator'] + self.extra_exclude_fields
                extra_fields = self.request.GET.get('extra_fields')
                if extra_fields:
                    for extra_field in extra_fields.split(','):
                        try:
                            kwargs['exclude'].remove(extra_field)
                        except Exception:
                            pass
            elif fields != '__all__':
                kwargs['fields'] = self.request.GET.get('fields').split(',')

        return serializer_class(*args, **kwargs)


class DataBrowserApiList(
    BaseDataBrowserApiList, viewsets.ReadOnlyModelViewSet
):
    """Return Data List API List."""

    @property
    def serializer_class(self):
        """Return serialize class."""
        if string_is_true(self.request.GET.get('detail', 'false')):
            return IndicatorValueWithPermissionSerializer
        return IndicatorValueSerializer

    def get_serializer_context(self):
        """For serializer context."""
        context = super().get_serializer_context()
        context.update({"user": self.request.user})
        reference_layers = self.request.GET.get('reference_layer_id__in', None)
        context.update(
            {
                "reference_layers": reference_layers.split(',')
                if reference_layers else None
            }
        )
        return context

    @swagger_auto_schema(
        operation_id='data-browser-list',
        tags=[ApiTag.DATA_BROWSER],
        manual_parameters=[
            *common_api_params,
            ApiParams.INDICATOR_ID,
            ApiParams.INDICATOR_SHORTCODE,
            ApiParams.DATASET_UUID,
            ApiParams.ADMIN_LEVEL,
            ApiParams.GEOM_ID,
            ApiParams.DATE_FROM,
            ApiParams.DATE_TO,
        ]
    )
    def list(self, request, *args, **kwargs):
        """List of dashboard."""
        try:
            return super().list(request, *args, **kwargs)
        except SuspiciousOperation as e:
            return HttpResponseBadRequest(f'{e}')

    @swagger_auto_schema(
        operation_id='data-browser-create',
        tags=[ApiTag.DATA_BROWSER],
        manual_parameters=[],
        request_body=IndicatorValueWithPermissionSerializer.
        Meta.post_body,
        responses={
            201: ''
        }
    )
    def post(self, request):
        """Post new value."""
        try:
            data = request.data
            if not data.get('indicator_id', 0) and not data.get(
                    'indicator_shortcode', None):
                return HttpResponseBadRequest(
                    'indicator_id or indicator_shortcode is required'
                )

            try:
                indicator = Indicator.objects.get(
                    id=data.get('indicator_id', 0)
                )
            except Indicator.DoesNotExist:
                try:
                    indicator = Indicator.objects.get(
                        shortcode=data.get('indicator_shortcode', '')
                    )
                except Indicator.DoesNotExist:
                    return HttpResponseBadRequest('Indicator does not exist')
            indicator.save_value(
                date=data['date'],
                geom_id=data['geom_id'],
                reference_layer=data['dataset_uuid'],
                admin_level=data['admin_level'],
                value=data['value'],
                extras=data.get('attributes', {})
            )
        except KeyError as e:
            return HttpResponseBadRequest(f'{e} is required on payload')
        except Exception as e:
            return HttpResponseBadRequest(f'{e}')
        return Response(status.HTTP_201_CREATED)

    @swagger_auto_schema(auto_schema=None)
    def put(self, request):
        """Batch update value of data."""
        try:
            data = request.data
            try:
                data = request.data['data']
                data = json.loads(request.data['data'])
            except TypeError:
                pass
            for row in data:
                try:
                    value = IndicatorValue.objects.get(id=row['id'])
                    if value.permissions(request.user)['edit']:
                        edited_value = row['value']
                        value.indicator.validate(edited_value)
                        value.value = edited_value
                        value.save()
                except (IndicatorValue.DoesNotExist, ValueError):
                    pass
                except IndicatorValueRejectedError as e:
                    return HttpResponseBadRequest(
                        f'Indicator {value.indicator}: {e}'
                    )
            return Response('OK')
        except KeyError:
            return HttpResponseBadRequest('`data` is required on payload')

    @swagger_auto_schema(
        operation_id='data-browser-delete',
        tags=[ApiTag.DATA_BROWSER],
        manual_parameters=[],
        request_body=IndicatorValueWithPermissionSerializer.
        Meta.delete_body,
    )
    def delete(self, request):
        """Batch delete data."""
        try:
            ids = json.loads(request.data['ids'])
        except TypeError:
            ids = request.data
        for value in IndicatorValue.objects.filter(id__in=ids):
            if value.permissions(request.user)['delete']:
                value.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @swagger_auto_schema(auto_schema=None)
    def retrieve(self, request, pk=None):
        """Return detailed of code list."""
        return super().retrieve(request, pk=pk)

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
            query = query.order_by('-date', 'id').values(*fields)
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
