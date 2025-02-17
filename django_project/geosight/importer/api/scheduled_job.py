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

from django.http import HttpResponseBadRequest
from rest_framework.generics import ListAPIView
from rest_framework.response import Response

from core.pagination import Pagination
from geosight.data.api.v1.base import BaseApiV1
from geosight.importer.models import Importer
from geosight.importer.serializer.importer import ImporterSerializer


class ScheduleJobListAPI(ListAPIView, BaseApiV1):
    """Return Schedule Job list."""

    pagination_class = Pagination
    serializer_class = ImporterSerializer

    def get_queryset(self):
        """Return queryset of API."""
        query = Importer.objects.all()
        if self.request.user.is_anonymous:
            return query.none()
        if not self.request.user.profile.is_admin:
            query = Importer.objects.filter(
                creator=self.request.user
            ).order_by('job_name')

        # Filter by parameters
        query = self.filter_query(
            request=self.request,
            query=query,
            ignores=['page', 'page_size'],
            sort=self.request.query_params.get('sort')
        )
        return query

    def put(self, request):
        """Delete an basemap."""
        ids = json.loads(request.data['ids'])
        state = request.data.get('state', None)
        if not state:
            return HttpResponseBadRequest('State is empty.')
        if state not in ['pause', 'resume']:
            return HttpResponseBadRequest('State should be pause or resume.')

        for obj in Importer.objects.filter(id__in=ids):
            if obj.able_to_edit(self.request.user):
                job = obj.job
                if job:
                    job.enabled = state == 'resume'
                    job.save()
        return Response('Deleted')

    def delete(self, request):
        """Delete an importer."""
        ids = json.loads(request.data['ids'])
        for obj in Importer.objects.filter(id__in=ids):
            if obj.able_to_edit(self.request.user):
                obj.delete()
        return Response('Deleted')
