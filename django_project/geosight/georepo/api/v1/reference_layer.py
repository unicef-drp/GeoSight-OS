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

from core.api_utils import common_api_params, ApiTag, ApiParams
from core.permissions import (
    RoleContributorAuthenticationPermission,
    RoleCreatorAuthenticationPermission
)
from geosight.data.api.v1.base import BaseApiV1Resource
from geosight.georepo.models.reference_layer import ReferenceLayerView
from geosight.georepo.serializer.reference_layer import (
    ReferenceLayerViewSerializer
)


class ReferenceLayerViewSet(BaseApiV1Resource):
    """Reference Dataset view set."""

    model_class = ReferenceLayerView
    serializer_class = ReferenceLayerViewSerializer
    extra_exclude_fields = ['id']
    lookup_field = 'identifier'
    lookup_value_regex = '[0-9A-Fa-f]{8}(-[0-9A-Fa-f]{4}){3}-[0-9A-Fa-f]{12}'
    http_method_names = ['get', 'delete']

    def get_permissions(self):
        """Get the permissions based on the action."""
        if self.action in ['create', 'destroy']:
            permission_classes = [RoleCreatorAuthenticationPermission]
        elif self.action in ['update', 'partial_update']:
            permission_classes = [RoleContributorAuthenticationPermission]
        else:
            permission_classes = []
        return [permission() for permission in permission_classes]

    @swagger_auto_schema(
        operation_id='reference-datasets-list',
        tags=[ApiTag.REFERENCE_DATASET],
        manual_parameters=[
            *common_api_params,
            ApiParams.NAME_CONTAINS,
            ApiParams.IDENTIFIER
        ],
        operation_description=(
                'Return list of accessed reference dataset for the user.'
        )
    )
    def list(self, request, *args, **kwargs):
        """List of reference-dataset."""
        return super().list(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_id='reference-datasets-detail',
        tags=[ApiTag.REFERENCE_DATASET],
        manual_parameters=[],
        operation_description='Return detailed of reference dataset.'
    )
    def retrieve(self, request, identifier=None):
        """Return detailed of reference-dataset."""
        return super().retrieve(request, identifier=identifier)

    @swagger_auto_schema(
        operation_id='reference-datasets-detail-delete',
        tags=[ApiTag.REFERENCE_DATASET],
        manual_parameters=[],
        operation_description='Delete a reference dataset.'
    )
    def destroy(self, request, identifier=None):
        """Destroy an object."""
        return super().destroy(request, id=identifier)
