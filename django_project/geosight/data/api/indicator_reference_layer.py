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
__date__ = '29/01/2024'
__copyright__ = ('Copyright 2023, Unicef')

from datetime import datetime

from dateutil import parser as date_parser
from django.http import HttpResponseBadRequest
from rest_framework.response import Response
from rest_framework.views import APIView

from geosight.data.models.indicator import Indicator
from geosight.georepo.models.reference_layer import (
    ReferenceLayerView
)
from geosight.permission.access import (
    read_permission_resource, ResourcePermissionDenied
)


class _BaseAPI(APIView):
    """Base API."""

    def check_permission(self, user, reference_layer, indicator):
        """Check permission."""
        from geosight.georepo.models.reference_layer import (
            ReferenceLayerIndicator
        )
        from geosight.permission.models.resource import (
            ReferenceLayerIndicatorPermission
        )
        from geosight.permission.models.factory import PERMISSIONS

        ref, created = ReferenceLayerIndicator.permissions.get_or_create(
            user=user,
            indicator=indicator,
            have_creator=False,
            reference_layer=reference_layer
        )
        try:
            read_permission_resource(ref, user)
        except ReferenceLayerIndicatorPermission.DoesNotExist:
            ref.permission = ReferenceLayerIndicatorPermission(
                organization_permission=PERMISSIONS.NONE.name,
                public_permission=PERMISSIONS.NONE.name
            )
            read_permission_resource(ref, user)

    def return_parameters(self, request):
        """Return parameters for data."""
        max_time = request.GET.get('time__lte', None)
        if max_time:
            max_time = date_parser.parse(max_time)
            max_time = datetime.combine(
                max_time, datetime.max.time()
            )
        else:
            max_time = datetime.now()

        min_time = request.GET.get('time__gte', None)
        if min_time:
            min_time = date_parser.parse(min_time).date()
        return min_time, max_time

    def return_reference_view(self):
        """Return reference view."""
        identifier = self.request.GET.get('reference_layer_uuid', None)
        if identifier:
            reference_layer, _ = ReferenceLayerView.objects.get_or_create(
                identifier=identifier
            )
            return reference_layer
        return None


class IndicatorBatchMetadataAPI(_BaseAPI):
    """API for Values of indicator."""

    def post(self, request, **kwargs):
        """Return Values."""
        reference_layer = self.return_reference_view()
        if not reference_layer:
            return HttpResponseBadRequest(
                'reference_layer_uuid is required'
            )

        data = request.data
        responses = {}
        for indicator in Indicator.objects.filter(id__in=data):
            try:
                self.check_permission(
                    self.request.user, reference_layer, indicator
                )
                responses[indicator.id] = indicator.metadata_with_cache(
                    reference_layer
                )
            except ResourcePermissionDenied:
                responses[indicator.id] = {
                    'dates': [],
                    'error': (
                        "You don't have permission to access this resource"
                    ),
                    'count': 0,
                    'version': indicator.version_with_reference_layer_uuid(
                        reference_layer.version_with_uuid
                    )
                }
        return Response(responses)
