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

from django.http import HttpResponseForbidden
from django.shortcuts import get_object_or_404
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.api.base import FilteredAPI
from core.pagination import Pagination
from geosight.importer.models.log import (
    ImporterLog
)
from geosight.importer.serializer.log import (
    ImporterLogSerializer
)


class ImporterLogListAPI(ListAPIView, FilteredAPI):
    """Return Data List API List."""

    pagination_class = Pagination
    serializer_class = ImporterLogSerializer

    def get_serializer_context(self):
        """For serializer context."""
        context = super().get_serializer_context()
        context.update({"user": self.request.user})
        return context

    def get_queryset(self):
        """Return queryset of API."""
        query = ImporterLog.objects.all().order_by('-start_time')
        if not self.request.user.profile.is_admin:
            query = ImporterLog.objects.filter(
                importer__creator=self.request.user
            ).prefetch_related(
                'importerlogdata_set'
            ).order_by('importer', '-end_time')

        # Filter by parameters
        query = self.filter_query(self.request, query, ['page', 'page_size'])
        return query

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
        return Response(
            ImporterLogSerializer(obj, context={'user': request.user}).data
        )

    def delete(self, request, pk):
        """Delete an basemap."""
        obj = get_object_or_404(ImporterLog, pk=pk)
        if not obj.importer.able_to_edit(self.request.user):
            return HttpResponseForbidden()
        obj.delete()
        return Response('Deleted')
