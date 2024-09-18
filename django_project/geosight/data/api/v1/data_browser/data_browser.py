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
from django.http import HttpResponseBadRequest
from drf_yasg.utils import swagger_auto_schema
from rest_framework import status
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from core.api_utils import common_api_params, ApiTag, ApiParams
from core.utils import string_is_true
from geosight.data.models.indicator import (
    Indicator, IndicatorValue, IndicatorValueRejectedError
)
from geosight.data.serializer.indicator import (
    IndicatorValueSerializer, IndicatorValueWithPermissionSerializer
)
from .base import BaseDataApiList


class BaseDataBrowserApiList(BaseDataApiList):
    """Return Data List API List."""

    filter_query_exclude = [
        'page', 'page_size', 'group_admin_level', 'detail'
    ]

    def get_queryset(self):
        """Return queryset of API."""
        query = super().get_queryset()
        ids = query.values_list('id', flat=True)
        return IndicatorValue.objects.filter(id__in=list(ids)).order_by(
            'indicator_id', '-date', 'geom_id'
        )


class DataBrowserApiList(BaseDataBrowserApiList, ListAPIView):
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
    def get(self, request, *args, **kwargs):
        """Browse indicator data."""
        try:
            return self.list(request, *args, **kwargs)
        except SuspiciousOperation as e:
            return HttpResponseBadRequest(f'{e}')

    @swagger_auto_schema(
        operation_id='data-browser-create',
        tags=[ApiTag.DATA_BROWSER],
        manual_parameters=[],
        request_body=IndicatorValueWithPermissionSerializer.
        Meta.swagger_schema_fields['post_body'],
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
                        f'Indicator {value.indicator} : {e}'
                    )
            return Response('OK')
        except KeyError:
            return HttpResponseBadRequest('`data` is required on payload')

    @swagger_auto_schema(
        operation_id='data-browser-delete',
        tags=[ApiTag.DATA_BROWSER],
        manual_parameters=[],
        request_body=IndicatorValueWithPermissionSerializer.
        Meta.swagger_schema_fields['delete_body'],
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


class DataBrowserApiListIds(APIView, BaseDataBrowserApiList):
    """Return Just ids Data List."""

    @swagger_auto_schema(auto_schema=None)
    def get(self, request):
        """Get ids of data."""
        return Response(
            self.get_queryset().values_list('id', flat=True)
        )
