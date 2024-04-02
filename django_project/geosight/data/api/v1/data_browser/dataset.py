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

from django.contrib.postgres.aggregates import StringAgg
from django.core.exceptions import SuspiciousOperation
from django.db.models import Count, F, Max, Min, CharField, Value
from django.db.models.functions import Concat, Cast
from django.http import HttpResponseBadRequest
from django.urls import reverse
from drf_yasg.utils import swagger_auto_schema
from rest_framework import status
from rest_framework.generics import ListAPIView
from rest_framework.response import Response

from core.api_utils import common_api_params, ApiTag, ApiParams
from geosight.data.models.indicator import (
    IndicatorValueWithGeo, IndicatorValue
)
from geosight.data.models.indicator.indicator_value_dataset import (
    IndicatorValueDataset
)
from geosight.data.serializer.indicator_value_dataset import (
    IndicatorValueDatasetSerializer
)
from geosight.georepo.models.reference_layer import ReferenceLayerIndicator
from .base import BaseDataApiList


class BaseDatasetApiList:
    """Contains queryset."""

    def get_queryset(self):
        """Return queryset of API."""
        group_admin_level = self.request.GET.get('group_admin_level', False)
        if not group_admin_level:
            return super().get_queryset().values(
                'indicator_id', 'reference_layer_id', 'admin_level'
            ).annotate(
                id=F('identifier_with_level')
            ).annotate(
                data_count=Count('*')
            ).annotate(
                identifier=F('identifier')
            ).annotate(
                indicator_name=F('indicator_name')
            ).annotate(
                indicator_shortcode=F('indicator_shortcode')
            ).annotate(
                reference_layer_name=F('reference_layer_name')
            ).annotate(
                reference_layer_uuid=F('reference_layer_uuid')
            ).annotate(
                start_date=Min('date')
            ).annotate(
                end_date=Max('date')
            ).order_by(
                'indicator_name', 'reference_layer_name', 'admin_level'
            )
        else:
            return super().get_queryset().values(
                'indicator_id', 'reference_layer_id'
            ).annotate(
                admin_level=StringAgg(
                    Cast('admin_level', CharField()), delimiter=', ',
                    distinct=True,
                    output_field=CharField()
                )
            ).annotate(
                id=Concat(
                    'identifier', Value('['), 'admin_level', Value(']'),
                    output_field=CharField()
                )
            ).annotate(
                data_count=Count('*')
            ).annotate(
                identifier=F('identifier')
            ).annotate(
                indicator_name=F('indicator_name')
            ).annotate(
                indicator_shortcode=F('indicator_shortcode')
            ).annotate(
                reference_layer_name=F('reference_layer_name')
            ).annotate(
                reference_layer_uuid=F('reference_layer_uuid')
            ).annotate(
                start_date=Min('date')
            ).annotate(
                end_date=Max('date')
            ).order_by(
                'indicator_name', 'reference_layer_name', 'admin_level'
            )


class DatasetApiList(BaseDatasetApiList, BaseDataApiList, ListAPIView):
    """Return Dataset with indicator x reference layer x level."""

    serializer_class = IndicatorValueDatasetSerializer
    filter_query_exclude = ['page', 'page_size', 'group_admin_level']

    def get_serializer(self, *args, **kwargs):
        """Return serializer of data."""
        data = []
        for row in args[0]:
            row['reference_layer_id'] = row['reference_layer_uuid']
            data.append(IndicatorValueDataset(**row))
        serializer_class = self.get_serializer_class()
        kwargs.setdefault('context', self.get_serializer_context())
        return serializer_class(data, **kwargs)

    def get_serializer_context(self):
        """For serializer context."""
        curr_url = self.request.path
        full_url = self.request.build_absolute_uri()
        context = super().get_serializer_context()
        context.update({"user": self.request.user})
        context.update(
            {
                "browse-data": full_url.replace(
                    curr_url, reverse('data-browser-api')
                )
            }
        )
        return context

    @swagger_auto_schema(
        operation_id='dataset-get',
        tags=[ApiTag.DATA_BROWSER],
        manual_parameters=[
            *common_api_params,
            ApiParams.INDICATOR_ID,
            ApiParams.INDICATOR_SHORTCODE,
            ApiParams.DATASET_UUID,
            ApiParams.ADMIN_LEVEL
        ],
        operation_description=(
                'Return indicator data information by reference view, '
                'indicator and admin level.'
        )
    )
    def get(self, request, *args, **kwargs):
        """Return indicator data by dataset, indicator and level."""
        try:
            return self.list(request, *args, **kwargs)
        except SuspiciousOperation as e:
            return HttpResponseBadRequest(f'{e}')

    @swagger_auto_schema(auto_schema=None)
    def delete(self, request):
        """Batch delete data."""
        try:
            ids = json.loads(request.data['ids'])
        except TypeError:
            ids = request.data
        user = request.user
        to_be_deleted = []
        for _id in ids:
            id_tobe_deleted = [_id]
            is_delete = False

            try:
                [identifier, admin_levels] = _id.split('[')
                [indicator_id, reference_layer_id] = identifier.split('-')
                admin_levels = admin_levels.replace(']', '').split(', ')
                id_tobe_deleted = []
                for admin_level in admin_levels:
                    id_tobe_deleted.append(f'{identifier}-{admin_level}')
            except ValueError:
                [indicator_id, reference_layer_id, admin_level] = _id.split(
                    '-'
                )

            # If user is admin
            if user.is_authenticated and user.profile.is_admin:
                is_delete = True
            else:
                try:
                    resource = ReferenceLayerIndicator.objects.get(
                        reference_layer_id=reference_layer_id,
                        indicator_id=indicator_id
                    )
                    if resource.permission.has_delete_perm(self.request.user):
                        is_delete = True
                except ReferenceLayerIndicator.DoesNotExist:
                    pass
            if is_delete:
                to_be_deleted += id_tobe_deleted
        ids = IndicatorValueWithGeo.objects.filter(
            identifier_with_level__in=to_be_deleted
        ).values_list('id', flat=True)
        IndicatorValue.objects.filter(id__in=list(ids)).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class DatasetApiListIds(BaseDatasetApiList, BaseDataApiList, ListAPIView):
    """Return Just ids Data List."""

    filter_query_exclude = ['page', 'page_size', 'group_admin_level']

    @swagger_auto_schema(auto_schema=None)
    def get(self, request):
        """Get ids of data."""
        return Response(
            self.get_queryset().values_list('id', flat=True)
        )


class DatasetApiQuickData(BaseDatasetApiList, BaseDataApiList, ListAPIView):
    """Return quick data for the data.

    Example: It will return list of indicators, datasets, levels.
    """

    filter_query_exclude = ['page', 'page_size', 'group_admin_level']

    @swagger_auto_schema(auto_schema=None)
    def get(self, request):
        """Get ids of data."""
        indicator_id = 'indicator_id'
        reference_layer_uuid = 'reference_layer_uuid'
        admin_level = 'admin_level'
        return Response({
            'indicators': self.get_queryset().order_by(
                indicator_id
            ).values(
                indicator_id
            ).values_list(
                indicator_id, flat=True
            ).distinct(),

            'datasets': self.get_queryset().order_by(
                reference_layer_uuid
            ).values(
                reference_layer_uuid
            ).values_list(
                reference_layer_uuid, flat=True
            ).distinct(),

            'levels': self.get_queryset().order_by(
                admin_level
            ).values(
                admin_level
            ).values_list(
                admin_level, flat=True
            ).distinct(),
        })
