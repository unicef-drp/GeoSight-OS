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

from drf_yasg.utils import swagger_auto_schema
from rest_framework import viewsets

from core.api_utils import common_api_params, ApiTag, ApiParams
from geosight.data.api.v1.base import BaseApiV1
from geosight.georepo.serializer.reference_layer import (
    ReferenceLayerViewSerializer, ReferenceLayerView
)


class ReferenceLayerViewSet(BaseApiV1, viewsets.ReadOnlyModelViewSet):
    """Boundary view set."""

    serializer_class = ReferenceLayerViewSerializer
    lookup_field = 'identifier'
    lookup_value_regex = '[0-9A-Fa-f]{8}(-[0-9A-Fa-f]{4}){3}-[0-9A-Fa-f]{12}'

    @property
    def queryset(self):
        """Return the queryset."""
        return ReferenceLayerView.locals.all().order_by('name')

    @swagger_auto_schema(
        operation_id='boundary-list',
        tags=[ApiTag.BOUNDARY],
        manual_parameters=[
            *common_api_params,
            ApiParams.NAME_CONTAINS,
            ApiParams.IDENTIFIER
        ],
        operation_description='Return list of accessed boundary for the user.'
    )
    def list(self, request, *args, **kwargs):
        """List of boundary."""
        return super().list(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_id='boundary-detail',
        tags=[ApiTag.BOUNDARY],
        manual_parameters=[],
        operation_description='Return detailed of boundary.'
    )
    def retrieve(self, request, identifier=None):
        """Return detailed of boundary."""
        return super().retrieve(request, identifier=identifier)
