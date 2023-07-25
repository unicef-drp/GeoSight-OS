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
from rest_framework.response import Response
from rest_framework.views import APIView

from geosight.importer.models.importer import Importer
from geosight.importer.serializer.importer import ImporterSerializer


class ScheduleJobListAPI(APIView):
    """Return Schedule Job list."""

    def get(self, request):
        """Return Schedule Job  list."""
        return Response(
            ImporterSerializer(
                Importer.objects.filter(job__isnull=False),
                many=True,
                exclude=['logs']
            ).data
        )

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
        """Delete an basemap."""
        ids = json.loads(request.data['ids'])
        for obj in Importer.objects.filter(id__in=ids):
            if obj.able_to_edit(self.request.user):
                obj.delete()
        return Response('Deleted')
