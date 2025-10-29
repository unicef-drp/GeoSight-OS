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

    def check_permission(self, user, indicator):
        """
        Check if the given user has permission to access the indicator.

        :param user: The user to check permission for.
        :type user: User
        :param indicator: The indicator object to check access against.
        :type indicator: Indicator
        """
        read_permission_resource(indicator, user)

    def return_parameters(self, request):
        """
        Return min and max time parameters from the request.

        Parses the GET parameters `time__gte` and `time__lte` from the request
        to return corresponding datetime objects.

        :param request: Django request object containing GET parameters.
        :type request: HttpRequest
        :return:
            Tuple of (min_time, max_time),
            where max_time defaults to now if not provided.
        :rtype: tuple[datetime.date or None, datetime.datetime]
        """
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
        """
        Return the ReferenceLayerView object based on the request parameter.

        Retrieves the `reference_layer_uuid` from the request's GET parameters
        and fetches or creates a corresponding ReferenceLayerView object.

        :return:
            ReferenceLayerView instance if `reference_layer_uuid` is provided,
            else None
        :rtype: ReferenceLayerView or None
        """
        identifier = self.request.GET.get('reference_layer_uuid', None)
        if identifier:
            reference_layer, _ = ReferenceLayerView.objects.get_or_create(
                identifier=identifier
            )
            return reference_layer
        return None


class IndicatorBatchMetadataAPI(_BaseAPI):
    """API for Values of indicator."""

    def post(self, request, **kwargs):  # noqa : DOC101, DOC103, DOC201
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
                read_permission_resource(indicator, self.request.user)
                responses[indicator.id] = indicator.metadata_with_cache(
                    reference_layer,
                    self.request.GET.get('is_using_uuid', False)
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
