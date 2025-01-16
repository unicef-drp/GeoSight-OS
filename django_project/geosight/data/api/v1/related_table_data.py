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
from rest_framework.exceptions import MethodNotAllowed, ParseError
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response
from rest_framework.status import HTTP_201_CREATED, HTTP_204_NO_CONTENT

from core.api_utils import ApiTag
from geosight.data.api.v1.base import BaseApiV1Resource
from geosight.data.models import RelatedTableRow, RelatedTable
from geosight.data.serializer.related_table import (
    RelatedTableRowApiSerializer, RelatedTableRowApiFlatSerializer
)
from geosight.permission.access import (
    read_permission_resource, edit_permission_resource,
    delete_permission_resource
)


class RelatedTableDataViewSet(BaseApiV1Resource):
    """Related Table Data ViewSet."""

    model_class = RelatedTableRow
    extra_exclude_fields = []

    @property
    def serializer_class(self):
        """Return serializer."""
        is_flat = self.request.GET.get('flat', None)
        if is_flat:
            return RelatedTableRowApiFlatSerializer
        else:
            return RelatedTableRowApiSerializer

    def _get_related_table(self):  # noqa: D102
        related_table_id = self.kwargs.get('related_tables_id')
        related_table = get_object_or_404(
            RelatedTable.objects.filter(pk=related_table_id)
        )
        read_permission_resource(related_table, self.request.user)
        return related_table

    def get_queryset(self):
        """Return queryset of API."""
        related_table = self._get_related_table()
        query = RelatedTableRow.objects.filter(
            table_id=related_table.id
        ).order_by('id')
        return self.filter_query(
            self.request, query, ['page', 'page_size', 'flat']
        )

    def get_serializer(self, *args, **kwargs):  # noqa: D102
        kwargs.setdefault('context', self.get_serializer_context())
        return self.serializer_class(*args, **kwargs)

    @swagger_auto_schema(
        operation_id='related-table-data-list',
        tags=[ApiTag.RELATED_TABLE_DATA],
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
        operation_id='related-table-data-detail',
        tags=[ApiTag.RELATED_TABLE_DATA],
        operation_description=
        'Return detail of a related table row for the user.',
        responses={
            200: openapi.Response(
                description="Resource fetching successful.",
                schema=RelatedTableRowApiSerializer(many=False)
            )
        }
    )
    def retrieve(self, request, *args, **kwargs):
        """Get a single related table row."""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @swagger_auto_schema(
        operation_id='related-table-data-create',
        tags=[ApiTag.RELATED_TABLE_DATA],
        manual_parameters=[],
        request_body=RelatedTableRowApiSerializer.
        Meta.swagger_schema_fields['post_body'],
        operation_description='Create related table rows.'
    )
    def create(self, request, *args, **kwargs):
        """Create related table rows."""
        serializer = self._get_valid_serializer_or_throw(request, many=True)
        related_table = self._get_related_table()
        edit_permission_resource(related_table, request.user)
        inserted_rows = [related_table.insert_row(obj['data'])
                         for obj in serializer.validated_data]
        serializer = self.get_serializer(inserted_rows, many=True)
        return Response(serializer.data, status=HTTP_201_CREATED)

    @swagger_auto_schema(
        operation_id='related-table-data-update',
        tags=[ApiTag.RELATED_TABLE_DATA],
        manual_parameters=[],
        request_body=RelatedTableRowApiSerializer.
        Meta.swagger_schema_fields['post_body'],
        operation_description='Update a related table row.'
    )
    def update(self, request, *args, **kwargs):
        """Update a related table row."""
        # permissions
        related_table = self._get_related_table()
        edit_permission_resource(related_table, request.user)

        # validation
        id = kwargs.get('id')
        get_object_or_404(RelatedTableRow.objects.filter(pk=id))
        serializer = self._get_valid_serializer_or_throw(request, many=False)

        # update and return
        row = related_table.insert_row(serializer.validated_data, row_id=id)
        return Response(self.get_serializer(row).data)

    @swagger_auto_schema(
        operation_id='related-table-data-partial-update',
        tags=[ApiTag.RELATED_TABLE_DATA]
    )
    def partial_update(self, request, *args, **kwargs):
        """Update an existing related table row."""
        raise MethodNotAllowed('PATCH')

    @swagger_auto_schema(
        operation_id='related-table-data-delete',
        tags=[ApiTag.RELATED_TABLE_DATA],
        manual_parameters=[],
        operation_description='Delete a related table row.'
    )
    def destroy(self, request, *args, **kwargs):
        """Delete an existing related table row."""
        related_table = self._get_related_table()
        delete_permission_resource(related_table, request.user)
        self.perform_destroy(self.get_object())
        return Response(status=HTTP_204_NO_CONTENT)

    @swagger_auto_schema(
        operation_id='related-table-data-delete-all',
        tags=[ApiTag.RELATED_TABLE_DATA],
        manual_parameters=[],
        operation_description='Delete all related table rows.'
    )
    def delete(self, request, *args, **kwargs):
        """Delete an existing related table row."""
        related_table = self._get_related_table()
        delete_permission_resource(related_table, request.user)
        self.get_queryset().delete()
        return Response(status=HTTP_204_NO_CONTENT)

    def _get_valid_serializer_or_throw(self, request, many):
        """Get an already validated serializer."""
        serializer = self.get_serializer(data=request.data, many=many)
        if not serializer.is_valid() or len(serializer.validated_data) < 1:
            raise ParseError(serializer.errors)
        return serializer
