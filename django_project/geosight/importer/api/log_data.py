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

from django.core.exceptions import (
    FieldError, ValidationError, SuspiciousOperation
)
from django.http import Http404
from django.shortcuts import get_object_or_404
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.api.base import FilteredAPI
from core.pagination import Pagination
from geosight.georepo.models.reference_layer import ReferenceLayerView
from geosight.importer.models.log import (
    ImporterLog, ImporterLogDataSaveProgress
)
from geosight.importer.serializer.log import (
    ImporterLogDataSerializer,
    ImporterLogDataSaveProgressSerializer
)
from geosight.importer.tasks import run_save_log_data


class ImporterLogDataBaseAPI(FilteredAPI):
    """API for detail of Importer Log."""

    pagination_class = Pagination
    serializer_class = ImporterLogDataSerializer

    permission_classes = (IsAuthenticated,)

    def filter_query(
            self, request, query, ignores: list, fields: list = None,
            data_is_timestamp=False
    ):
        """Return filter query."""
        for param, value in request.GET.items():
            field = param.split('__')[0]
            if field in ignores:
                continue

            if fields and field not in fields:
                continue

            if '_in' in param:
                values = value.split(',')
                value = []
                for val in values:
                    try:
                        value.append(int(val))
                    except (TypeError, ValueError):
                        value.append(val)

            # Handle reference layer
            if 'reference_layer_id__in' in param:
                value = list(
                    ReferenceLayerView.objects.filter(
                        identifier__in=value
                    ).values_list('id', flat=True)
                )

            if 'date' in param:
                try:
                    value = int(value)
                except (TypeError, ValueError):
                    pass
            try:
                query = query.filter(**{param: value})
            except FieldError:
                raise SuspiciousOperation(f'Can not query param {param}')
            except ValidationError as e:
                raise SuspiciousOperation(e)
        return query

    def get_queryset(self):
        """Return queryset of API."""
        try:
            pk = self.kwargs['pk']
            obj = get_object_or_404(ImporterLog, pk=pk)
            query = self.filter_query(
                self.request, obj.importerlogdata_set.all(),
                ['page', 'page_size', 'status']
            )
            if self.request.GET.get('status__in'):
                query = query.exclude(note={})
            return query
        except KeyError:
            raise Http404()


class ImporterLogDataAPI(ImporterLogDataBaseAPI, ListAPIView):
    """API for detail of Importer Log."""

    def post(self, request, pk):
        """Delete an basemap."""
        obj = get_object_or_404(ImporterLog, pk=pk)
        progress = ImporterLogDataSaveProgress.objects.create(
            log=obj, target_ids=json.loads(request.data['data'])
        )
        run_save_log_data.delay(progress.id)
        return Response('OK')


class ImporterLogDataIdsAPI(APIView, ImporterLogDataBaseAPI):
    """API for returning detail of api."""

    def get(self, request, pk):
        """Get ids of data."""
        return Response(self.get_queryset().values_list('id', flat=True))


class ImporterLogDataProgresAPI(APIView):
    """API for detail of Importer Log."""

    permission_classes = (IsAuthenticated,)

    def get(self, request, pk):
        """Delete an basemap."""
        obj = get_object_or_404(ImporterLog, pk=pk)
        progress = ImporterLogDataSaveProgress.objects.filter(
            log=obj, done=False
        ).first()
        if progress:
            return Response(
                ImporterLogDataSaveProgressSerializer(progress).data
            )
        else:
            raise Http404()
