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

from django.shortcuts import get_object_or_404
from drf_yasg.utils import swagger_auto_schema
from rest_framework import viewsets

from core.api_utils import common_api_params, ApiParams
from geosight.data.api.v1.base import BaseApiV1
from geosight.georepo.serializer.entity import ApiEntitySerializer
from geosight.permission.access import read_data_permission_resource
from geosight.reference_dataset.api.v1.api_utils import (
    ApiTag as ReferenceApiTag,
    ApiParams as ReferenceApiParams,
)
from geosight.reference_dataset.models import (
    ReferenceDataset
)


class EntityViewSet(BaseApiV1, viewsets.ReadOnlyModelViewSet):
    """Reference dataset view set."""

    serializer_class = ApiEntitySerializer
    lookup_field = 'geom_id'
    lookup_value_regex = '[^/]+'

    @property
    def queryset(self):
        """Return the queryset."""
        view = get_object_or_404(
            ReferenceDataset,
            identifier=self.kwargs.get('identifier', '')
        )
        read_data_permission_resource(view, self.request.user)
        return view.entities_set.all()

    @swagger_auto_schema(
        operation_id='reference-datasets-entity-list',
        tags=[ReferenceApiTag.REFERENCE_DATASET],
        manual_parameters=[
            *common_api_params,
            ApiParams.NAME_CONTAINS,
            ReferenceApiParams.CONCEPT_UUID,
            ApiParams.ADMIN_LEVEL,
        ],
        operation_description=(
                'Return list of accessed entity of '
                'reference dataset for the user.'
        )
    )
    def list(self, request, *args, **kwargs):
        """List of reference-dataset."""
        return super().list(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_id='reference-datasets-entity-detail',
        tags=[ReferenceApiTag.REFERENCE_DATASET],
        manual_parameters=[],
        operation_description=(
                'Return detailed of entity of reference dataset.'
        )
    )
    def retrieve(self, request, *args, **kwargs):
        """Return detailed of reference-dataset."""
        return super().retrieve(request, geom_id=kwargs['geom_id'])
