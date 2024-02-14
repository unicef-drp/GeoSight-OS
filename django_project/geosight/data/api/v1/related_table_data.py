"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""
__author__ = 'Víctor González'
__date__ = '12/02/2024'
__copyright__ = ('Copyright 2023, Unicef')

from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.generics import get_object_or_404

from core.api_utils import ApiTag
from geosight.data.api.v1.base import BaseApiV1Resource
from geosight.data.models import RelatedTableRow, RelatedTable
from geosight.data.serializer.related_table import RelatedTableRowApiSerializer
from geosight.permission.access import read_permission_resource


class RelatedTableDataViewSet(BaseApiV1Resource):
    """Related Table Data ViewSet."""

    model_class = RelatedTableRow
    serializer_class = RelatedTableRowApiSerializer
    extra_exclude_fields = []

    def get_queryset(self):  # noqa: D102
        related_table_id = self.kwargs.get('related_tables_id')
        related_table = get_object_or_404(
            RelatedTable.objects.filter(pk=related_table_id)
        )
        read_permission_resource(related_table, self.request.user)
        return RelatedTableRow.objects.filter(table_id=related_table_id)

    def get_serializer(self, *args, **kwargs):  # noqa: D102
        kwargs.setdefault('context', self.get_serializer_context())
        return RelatedTableRowApiSerializer(*args, **kwargs)

    @swagger_auto_schema(
        operation_id='related-tables-data-list',
        tags=[ApiTag.RELATED_TABLES_DATA],
        operation_description=
        'Return list of related table rows for the user.',
        responses={
            200: openapi.Response(
                description="Resource fetching successful.",
                schema=RelatedTableRowApiSerializer(many=True)
            )
        }
    )
    def list(self, request, *args, **kwargs):
        """List of related table rows."""
        return super().list(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_id='related-tables-data-detail',
        tags=[ApiTag.RELATED_TABLES_DATA]
    )
    def retrieve(self, request, *args, **kwargs):
        """Get a single related table row."""
        raise MethodNotAllowed('GET')

    @swagger_auto_schema(
        operation_id='related-tables-data-create',
        tags=[ApiTag.RELATED_TABLES_DATA],
    )
    def create(self, request, *args, **kwargs):
        """Create a related table row."""
        raise MethodNotAllowed('POST')

    @swagger_auto_schema(
        operation_id='related-tables-data-update',
        tags=[ApiTag.RELATED_TABLES_DATA],
    )
    def update(self, request, *args, **kwargs):
        """Update a related table row."""
        raise MethodNotAllowed('PUT')

    @swagger_auto_schema(
        operation_id='related-tables-data-partial-update',
        tags=[ApiTag.RELATED_TABLES_DATA]
    )
    def partial_update(self, request, *args, **kwargs):
        """Update an existing related table row."""
        raise MethodNotAllowed('PATCH')

    @swagger_auto_schema(
        operation_id='related-tables-data-delete',
        tags=[ApiTag.RELATED_TABLES_DATA],
    )
    def destroy(self, request, *args, **kwargs):
        """Delete an existing related table row."""
        raise MethodNotAllowed('DELETE')
