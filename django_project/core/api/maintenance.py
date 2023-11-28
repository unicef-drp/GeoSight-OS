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
__date__ = '20/11/2023'
__copyright__ = ('Copyright 2023, Unicef')

from datetime import datetime

from django.db.models import Q
from rest_framework.response import Response
from rest_framework.views import APIView

from core.models.maintenance import Maintenance
from core.serializer.maintenance import MaintenanceSerializer


class MaintenanceAPI(APIView):
    """Return Maintenance."""

    def get(self, request):
        """Return Maintenance."""
        current_datetime = datetime.now()
        maintenance = Maintenance.objects.filter(
            Q(scheduled_end__isnull=True) |
            Q(scheduled_end__gte=current_datetime)
        ).order_by('scheduled_from').first()

        if maintenance:
            return Response(
                MaintenanceSerializer(maintenance).data
            )
        return Response({})
