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

from django.core.exceptions import SuspiciousOperation
from django.db.models import Count, F, Max, Value, CharField
from django.db.models.functions import Concat
from django.http import HttpResponseBadRequest
from django.urls import reverse
from drf_yasg.utils import swagger_auto_schema
from rest_framework.generics import ListAPIView

from core.api_utils import common_api_params, ApiTag, ApiParams
from geosight.data.models.indicator.indicator_value_dataset import (
    IndicatorValueDataset
)
from geosight.data.serializer.indicator_value_dataset import (
    IndicatorValueDatasetSerializer
)
from .base import BaseDataApiList


class DatasetApiList(BaseDataApiList, ListAPIView):
    """Return Dataset with indicator x reference layer x level."""

    serializer_class = IndicatorValueDatasetSerializer

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

    def get_queryset(self):
        """Return queryset of API."""
        return super().get_queryset().values(
            'indicator_id', 'reference_layer_id', 'admin_level'
        ).filter(
            admin_level__isnull=False
        ).annotate(
            id=Concat(
                F('indicator_id'), Value('-'), F('reference_layer_id'),
                Value('-'), F('admin_level'),
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
            start_date=Max('date')
        ).annotate(
            end_date=Max('date')
        ).order_by(
            'indicator_name', 'reference_layer_name', 'admin_level'
        )

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
        """Return indicator data information by reference view, indicator
        and level."""
        try:
            return self.list(request, *args, **kwargs)
        except SuspiciousOperation as e:
            return HttpResponseBadRequest(f'{e}')
