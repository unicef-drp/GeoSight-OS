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

from django.http import HttpResponseForbidden, Http404
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from geosight.importer.models.log import (
    ImporterLog, ImporterLogDataSaveProgress
)
from geosight.importer.serializer.log import (
    ImporterLogSerializer, ImporterLogDataSerializer,
    ImporterLogDataSaveProgressSerializer
)
from geosight.importer.tasks import run_save_log_data


class ImporterLogListAPI(APIView):
    """Return ImporterLog list."""

    def get(self, request):
        """Return Importer Log list."""
        query = ImporterLog.objects.order_by(
            'importer', '-end_time').distinct('importer')
        if not request.user.profile.is_admin:
            query = ImporterLog.objects.filter(
                importer__creator=self.request.user
            ).order_by('importer', '-end_time').distinct('importer')

        return Response(
            ImporterLogSerializer(
                query,
                many=True
            ).data
        )

    def delete(self, request):
        """Delete objects."""
        ids = json.loads(request.data['ids'])
        for obj in ImporterLog.objects.filter(id__in=ids):
            if obj.importer.able_to_edit(self.request.user):
                obj.importer.importerlog_set.all().delete()
        return Response('Deleted')


class ImporterLogDetailAPI(APIView):
    """API for detail of Importer Log."""

    permission_classes = (IsAuthenticated,)

    def get(self, request, pk):
        """Delete an basemap."""
        obj = get_object_or_404(ImporterLog, pk=pk)
        return Response(ImporterLogSerializer(obj).data)

    def delete(self, request, pk):
        """Delete an basemap."""
        obj = get_object_or_404(ImporterLog, pk=pk)
        if not obj.importer.able_to_edit(self.request.user):
            return HttpResponseForbidden()
        obj.delete()
        return Response('Deleted')


class ImporterLogDataAPI(APIView):
    """API for detail of Importer Log."""

    permission_classes = (IsAuthenticated,)

    def get(self, request, pk):
        """Delete an basemap."""
        obj = get_object_or_404(ImporterLog, pk=pk)
        return Response(
            ImporterLogDataSerializer(
                obj.importerlogdata_set.all(), many=True
            ).data
        )

    def post(self, request, pk):
        """Delete an basemap."""
        obj = get_object_or_404(ImporterLog, pk=pk)
        progress = ImporterLogDataSaveProgress.objects.create(
            log=obj, target_ids=json.loads(request.data['data'])
        )
        run_save_log_data.delay(progress.id)
        return Response('OK')


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
