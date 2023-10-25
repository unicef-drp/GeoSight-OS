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

from django.core.exceptions import SuspiciousOperation
from django.db.models import Q
from django.http import HttpResponseBadRequest
from drf_yasg.utils import swagger_auto_schema
from rest_framework.authentication import (
    SessionAuthentication, BasicAuthentication
)
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.api.base import FilteredAPI
from core.api_utils import common_api_params, ApiTag, ApiParams
from core.auth import BearerAuthentication
from core.pagination import Pagination
from geosight.data.models.indicator import (
    IndicatorValue, IndicatorValueWithGeo, IndicatorValueRejectedError
)
from geosight.data.serializer.indicator import (
    IndicatorValueWithPermissionSerializer
)
from geosight.permission.models.resource import (
    ReferenceLayerIndicatorPermission
)


class DatasetApiList(ListAPIView, FilteredAPI):
    """Return Data List API List."""

    authentication_classes = [
        SessionAuthentication, BasicAuthentication, BearerAuthentication
    ]
    permission_classes = (IsAuthenticated,)
    pagination_class = Pagination
    serializer_class = IndicatorValueWithPermissionSerializer

    def get_serializer_context(self):
        """For serializer context."""
        context = super().get_serializer_context()
        context.update({"user": self.request.user})
        return context

    def get_param_value(self, param_key: str) -> list:
        """Return paramater value as list."""
        values = self.request.GET.get(param_key, None)
        if values:
            return values.split(',')
        return None

    def get_queryset(self):
        """Return queryset of API."""
        query = None
        try:
            if self.request.user.profile.is_admin:
                query = IndicatorValueWithGeo.objects.all()
        except AttributeError:
            pass

        # If not query
        if not query:
            filters = None
            # Filter using indicator
            query = ReferenceLayerIndicatorPermission.permissions.list(
                user=self.request.user
            )
            for dataset in query:
                obj = dataset.obj
                row_query = Q(indicator_id=obj.indicator.id)
                row_query.add(
                    Q(reference_layer_id=obj.reference_layer.id), Q.AND
                )

                if not filters:
                    filters = row_query
                else:
                    filters.add(row_query, Q.OR)
            if not filters:
                query = IndicatorValueWithGeo.objects.none()
            else:
                query = IndicatorValueWithGeo.objects.filter(filters)

        # Filter by parameters
        query = self.filter_query(
            self.request, query, ['page', 'page_size']
        )

        ids = query.values_list('id', flat=True)
        return IndicatorValue.objects.filter(id__in=ids).order_by(
            'indicator_id', '-date', 'geom_id'
        )

    @swagger_auto_schema(
        operation_id='dataset-list-get',
        tags=[ApiTag.DATASET],
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
        try:
            return self.list(request, *args, **kwargs)
        except SuspiciousOperation as e:
            return HttpResponseBadRequest(f'{e}')

    @swagger_auto_schema(auto_schema=None)
    def put(self, request):
        """Batch update value of dataset."""
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
        operation_id='dataset-list-delete',
        tags=[ApiTag.DATASET],
        manual_parameters=[],
        request_body=IndicatorValueWithPermissionSerializer.
        Meta.swagger_schema_fields['delete_body'],
    )
    def delete(self, request):
        """Batch delete dataset."""
        ids = json.loads(request.data['ids'])
        for value in IndicatorValue.objects.filter(id__in=ids):
            if value.permissions(request.user)['delete']:
                value.delete()
        return Response('OK')
