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

from django.http import (
    HttpResponse, HttpResponseBadRequest, HttpResponseForbidden
)
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from geosight.importer.models.importer import Importer
from geosight.importer.serializer.importer import ImporterSerializer


class ImporterDetailAPI(APIView):
    """API for detail of Schedule Job ."""

    permission_classes = (IsAuthenticated,)

    def get(self, request, pk):
        """Delete an basemap."""
        obj = get_object_or_404(Importer, pk=pk)
        return Response(ImporterSerializer(obj).data)

    def delete(self, request, pk):
        """Delete an basemap."""
        obj = get_object_or_404(Importer, pk=pk)
        if not self.request.user.is_staff and self.request.user != obj.creator:
            return HttpResponseForbidden()
        if obj.job:
            obj.job.delete()
        obj.delete()
        return Response('Deleted')


class ImporterRunAPI(APIView):
    """API for detail of Schedule Job ."""

    permission_classes = (IsAuthenticated,)

    def post(self, request, pk):
        """Delete an basemap."""
        obj = get_object_or_404(Importer, pk=pk)
        if not obj.able_to_edit(self.request.user):
            return HttpResponseForbidden()
        url = obj.post_saved(force=True)
        if url:
            return HttpResponse(url, status=200)
        else:
            return HttpResponseBadRequest('The job already run')


class ImporterJobPauseAPI(APIView):
    """API for pause Schedule Job ."""

    permission_classes = (IsAuthenticated,)

    def post(self, request, pk):
        """Delete an basemap."""
        obj = get_object_or_404(Importer, pk=pk)
        if not obj.able_to_edit(self.request.user):
            return HttpResponseForbidden()
        job = obj.job
        if job:
            job.enabled = False
            job.save()
        return HttpResponse('OK', status=200)


class ImporterJobResumeAPI(APIView):
    """API for resume Schedule Job ."""

    permission_classes = (IsAuthenticated,)

    def post(self, request, pk):
        """Delete an basemap."""
        obj = get_object_or_404(Importer, pk=pk)
        if not obj.able_to_edit(self.request.user):
            return HttpResponseForbidden()
        job = obj.job
        if job:
            job.enabled = True
            job.save()
        return HttpResponse('OK', status=200)
