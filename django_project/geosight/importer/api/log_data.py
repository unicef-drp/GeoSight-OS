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
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.api.base import FilteredAPI
from core.pagination import Pagination
from geosight.georepo.models.reference_layer import ReferenceLayerView
from geosight.importer.api.log import get_importer_log
from geosight.importer.models.log import ImporterLogDataSaveProgress
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
        """
        Return query filtered by request parameters.

        :param request: The HTTP request containing the filter parameters.
        :type request: rest_framework.request.Request
        :param query: The queryset to be filtered.
        :type query: django.db.models.QuerySet
        :param ignores: Parameters that are not used as filter.
        :type ignores: list
        :param fields: Fields that are allowed to be filtered, all if None.
        :type fields: list
        :param data_is_timestamp: Unused, kept for compatibility.
        :type data_is_timestamp: bool
        :return: The filtered queryset.
        :rtype: django.db.models.QuerySet
        :raises SuspiciousOperation:
            If a parameter is not allowed or not valid.
        """
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
                self._validate_orm_param(param)
                query = query.filter(**{param: value})
            except FieldError:
                raise SuspiciousOperation(f'Can not query param {param}')
            except ValidationError as e:
                raise SuspiciousOperation(e)
        return query

    def get_queryset(self):
        """
        Return data of the log that the user has permission on.

        :return: Queryset of the log data.
        :rtype: django.db.models.QuerySet
        :raises Http404: If pk is not provided.
        """
        try:
            pk = self.kwargs['pk']
            obj = get_importer_log(pk, self.request.user)
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
        """
        Save the selected data of the log to the actual model.

        :param request: The HTTP request containing ``data`` (list of ids).
        :type request: rest_framework.request.Request
        :param pk: The primary key of the log.
        :type pk: int
        :return: Response with OK message.
        :rtype: rest_framework.response.Response
        """
        obj = get_importer_log(pk, request.user, 'edit')
        progress = ImporterLogDataSaveProgress.objects.create(
            log=obj, target_ids=json.loads(request.data['data'])
        )
        run_save_log_data.delay(progress.id)
        return Response('OK')


class ImporterLogDataIdsAPI(APIView, ImporterLogDataBaseAPI):
    """API for returning detail of api."""

    def get(self, request, pk):
        """
        Return ids of the data of the log.

        :param request: The HTTP request.
        :type request: rest_framework.request.Request
        :param pk: The primary key of the log.
        :type pk: int
        :return: Response with list of ids.
        :rtype: rest_framework.response.Response
        """
        return Response(self.get_queryset().values_list('id', flat=True))


class ImporterLogDataProgresAPI(APIView):
    """API for detail of Importer Log."""

    permission_classes = (IsAuthenticated,)

    def get(self, request, pk):
        """
        Return progress of saving the data of the log.

        :param request: The HTTP request.
        :type request: rest_framework.request.Request
        :param pk: The primary key of the log.
        :type pk: int
        :return: Response with the running progress.
        :rtype: rest_framework.response.Response
        :raises Http404: If there is no running progress.
        """
        obj = get_importer_log(pk, request.user)
        progress = ImporterLogDataSaveProgress.objects.filter(
            log=obj, done=False
        ).first()
        if progress:
            return Response(
                ImporterLogDataSaveProgressSerializer(progress).data
            )
        else:
            raise Http404()
