"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""
__author__ = 'Víctor González'
__date__ = '29/01/2024'
__copyright__ = ('Copyright 2023, Unicef')

from drf_yasg.openapi import Response
from drf_yasg.utils import swagger_auto_schema
from rest_framework.exceptions import MethodNotAllowed

from core.api_utils import ApiTag
from geosight.data.api.v1.base import BaseApiV1Resource
from geosight.data.models import RelatedTable
from geosight.data.serializer.related_table import RelatedTableApiSerializer


class RelatedTableViewSet(BaseApiV1Resource):
    """Related Table ViewSet."""

    model_class = RelatedTable
    serializer_class = RelatedTableApiSerializer
    extra_exclude_fields = []

    @swagger_auto_schema(
        operation_id='related-tables-get',
        tags=[ApiTag.RELATED_TABLES],
        operation_description=
        'Return list of accessible related tables for the user.',
        responses={
            200: Response(
                description="Resource fetching successful.",
                schema=RelatedTableApiSerializer(many=True)
            )
        }
    )
    def list(self, request, *args, **kwargs):
        """List of related tables."""
        return super().list(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_id='related-tables-detail',
        tags=[ApiTag.RELATED_TABLES],
        operation_description=
        'Return detail of a related tables for the user.',
        responses={
            200: Response(
                description="Resource fetching successful.",
                schema=RelatedTableApiSerializer(many=False)
            )
        }
    )
    def retrieve(self, request, *args, **kwargs):
        """Detail of related table."""
        return super().retrieve(request, *args, **kwargs)

    @swagger_auto_schema(operation_id='related-tables-create',
                         tags=[ApiTag.RELATED_TABLES])
    def create(self, request, *args, **kwargs):
        """Create a related table."""
        raise MethodNotAllowed('POST')

    @swagger_auto_schema(operation_id='related-tables-update',
                         tags=[ApiTag.RELATED_TABLES])
    def update(self, request, *args, **kwargs):
        """Update an existing related table."""
        raise MethodNotAllowed('PUT')

    @swagger_auto_schema(operation_id='related-tables-partial_update',
                         tags=[ApiTag.RELATED_TABLES])
    def partial_update(self, request, *args, **kwargs):
        """Update an existing related table."""
        raise MethodNotAllowed('PATCH')

    @swagger_auto_schema(
        operation_id='related-tables-delete',
        tags=[ApiTag.RELATED_TABLES],
        manual_parameters=[],
        operation_description='Delete a related table.'
    )
    def destroy(self, request, *args, **kwargs):
        """Delete an existing related table."""
        return super().destroy(request, *args, **kwargs)
