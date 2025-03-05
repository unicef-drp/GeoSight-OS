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
from django.db.models import Value, Count, F, Max, Min, CharField
from django.db.models.functions import Concat, Cast
from django.http import HttpResponseBadRequest
from django.urls import reverse
from drf_yasg.utils import swagger_auto_schema
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from core.api_utils import common_api_params, ApiTag, ApiParams
from core.utils import string_is_true
from geosight.data.models.indicator import (
    IndicatorValue, Indicator
)
from geosight.data.models.indicator.indicator_value_dataset import (
    IndicatorValueDataset
)
from geosight.data.serializer.indicator_value_dataset import (
    IndicatorValueDatasetSerializer
)
from .base import BaseIndicatorValueApi


class BaseDatasetApiList:
    """Contains queryset."""

    filter_query_exclude = [
        'page', 'page_size', 'group_admin_level', 'detail'
    ]
    serializer_class = IndicatorValueDatasetSerializer

    @property
    def group_admin_level(self):
        """Return group admin level."""
        return self.request.GET.get(
            'group_admin_level', 'False'
        ).lower() == 'true'

    def get_queryset(self):
        """Return queryset of API."""
        if not self.group_admin_level:
            return super().get_queryset().values(
                'indicator_id', 'country_id', 'admin_level'
            ).annotate(
                data_count=Count('*')
            ).annotate(
                indicator_name=F('indicator_name')
            ).annotate(
                indicator_name=F('indicator_shortcode')
            ).annotate(
                country_name=F('country_geom_id')
            ).annotate(
                country_name=F('country_name')
            ).annotate(
                start_date=Min('date')
            ).annotate(
                end_date=Max('date')
            ).order_by(
                'indicator_id', 'country_id', 'admin_level'
            ).filter(country_id__isnull=False)
        else:
            return super().get_queryset().values(
                'indicator_id', 'country_id'
            ).annotate(
                admin_level=StringAgg(
                    Cast('admin_level', CharField()),
                    delimiter=', ',
                    distinct=True,
                    output_field=CharField()
                )
            ).annotate(
                data_count=Count('*')
            ).annotate(
                indicator_name=F('indicator_name')
            ).annotate(
                indicator_name=F('indicator_shortcode')
            ).annotate(
                country_name=F('country_geom_id')
            ).annotate(
                country_name=F('country_name')
            ).annotate(
                start_date=Min('date')
            ).annotate(
                end_date=Max('date')
            ).order_by(
                'indicator_id', 'country_id'
            ).filter(country_id__isnull=False)


class DatasetApiList(
    BaseDatasetApiList, BaseIndicatorValueApi, viewsets.ReadOnlyModelViewSet
):
    """Return Dataset with indicator, country and admin level."""

    def get_serializer(self, *args, **kwargs):
        """Return serializer of data."""
        data = []
        for row in args[0]:
            data.append(IndicatorValueDataset(**row))
        if not string_is_true(self.request.GET.get('detail', 'false')):
            kwargs['exclude'] = ['permission']
        serializer_class = self.get_serializer_class()
        kwargs.setdefault('context', self.get_serializer_context())
        return serializer_class(data, **kwargs)

    def get_serializer_context(self):
        """For serializer context."""
        curr_url = self.request.path
        full_url = self.request.build_absolute_uri()
        context = super().get_serializer_context()
        context.update({"user": self.request.user})
        context.update({"group_admin_level": self.group_admin_level})
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
            ApiParams.DATASET_UUID,
            ApiParams.ADMIN_LEVEL
        ],
        operation_description=(
                'Return indicator data information by country, '
                'indicator and admin level.'
        )
    )
    def list(self, request, *args, **kwargs):
        """Return indicator data by dataset, indicator and level."""
        try:
            return super().list(request, *args, **kwargs)
        except SuspiciousOperation as e:
            return HttpResponseBadRequest(f'{e}')

    @swagger_auto_schema(auto_schema=None)
    def retrieve(self, request, id=None):
        """Return detailed of basemap."""
        return super().retrieve(request, id=id)

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
                [indicator_id, country_id] = identifier.split('-')
                admin_levels = admin_levels.replace(']', '').split(', ')
                id_tobe_deleted = []
                for admin_level in admin_levels:
                    id_tobe_deleted.append(f'{identifier}-{admin_level}')
            except ValueError:
                [indicator_id, country_id, admin_level] = _id.split(
                    '-'
                )

            # If user is admin
            if user.is_authenticated and user.profile.is_admin:
                is_delete = True
            else:
                try:
                    resource = Indicator.objects.get(id=indicator_id)
                    if resource.permission.has_delete_perm(self.request.user):
                        is_delete = True
                except Indicator.DoesNotExist:
                    pass
            if is_delete:
                to_be_deleted += id_tobe_deleted

        for _id in to_be_deleted:
            [indicator_id, country_id, admin_level] = _id.split('-')
            admin_levels = admin_level.replace('[', '').replace(']', '').split(
                ','
            )
            IndicatorValue.objects.filter(
                indicator_id=indicator_id,
                country_id=country_id,
                admin_level__in=admin_levels
            ).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @swagger_auto_schema(auto_schema=None)
    @action(detail=False, methods=['get'])
    def ids(self, request):
        """Get ids of data."""
        return Response(
            self.get_queryset().annotate(
                identifier=Concat(
                    'indicator_id',
                    Value('-'),
                    'country_id',
                    Value('-['),
                    'admin_level',
                    Value(']'),
                    output_field=CharField()
                )
            ).values_list('identifier', flat=True)
        )

    @swagger_auto_schema(auto_schema=None)
    @action(detail=False, methods=['get'])
    def data(self, request):
        """Get data."""
        indicator_id = 'indicator_id'
        country_geom_id = 'country_geom_id'
        admin_level = 'admin_level'
        return Response({
            'indicators': self.get_queryset().order_by(
                indicator_id
            ).values_list(
                indicator_id, flat=True
            ).distinct(),

            'datasets': self.get_queryset().order_by(
                country_geom_id
            ).values_list(
                country_geom_id, flat=True
            ).distinct(),

            'levels': self.get_queryset().order_by(
                admin_level
            ).values_list(
                admin_level, flat=True
            ).distinct(),
        })
