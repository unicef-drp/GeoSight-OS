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

from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework.exceptions import MethodNotAllowed, ParseError
from rest_framework.response import Response
from rest_framework.status import HTTP_201_CREATED

from core.api_utils import ApiTag
from geosight.data.api.v1.base import BaseApiV1Resource
from geosight.data.models import RelatedTable
from geosight.data.serializer.related_table import RelatedTableApiSerializer
from geosight.permission.access import edit_permission_resource


class RelatedTableViewSet(BaseApiV1Resource):
    """Related Table ViewSet."""

    model_class = RelatedTable
    serializer_class = RelatedTableApiSerializer
    extra_exclude_fields = [
        'fields_definition', 'version_data'
    ]

    @swagger_auto_schema(
        operation_id='related-table-list',
        tags=[ApiTag.RELATED_TABLE],
        operation_description=
        'Return list of accessible related tables for the user.',
        responses={
            200: openapi.Response(
                description="Resource fetching successful.",
                schema=RelatedTableApiSerializer(many=True)
            )
        }
    )
    def list(self, request, *args, **kwargs):
        """List of related tables."""
        return super().list(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_id='related-table-detail',
        tags=[ApiTag.RELATED_TABLE],
        operation_description=
        'Return detail of a related tables for the user.',
        responses={
            200: openapi.Response(
                description="Resource fetching successful.",
                schema=RelatedTableApiSerializer(many=False)
            )
        }
    )
    def retrieve(self, request, *args, **kwargs):
        """Detail of related table."""
        return super().retrieve(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_id='related-table-create',
        tags=[ApiTag.RELATED_TABLE],
        manual_parameters=[],
        request_body=RelatedTableApiSerializer.
        Meta.swagger_schema_fields['post_body'],
        operation_description='Create a related table.'
    )
    def create(self, request, *args, **kwargs):
        """Create a related table."""
        serializer = self._get_valid_serializer_or_throw(request)
        instance = serializer.create(serializer.validated_data.copy())
        instance.creator = request.user
        instance.save()
        response = RelatedTableApiSerializer(instance).data
        return Response(response, status=HTTP_201_CREATED)

    @swagger_auto_schema(
        operation_id='related-table-update',
        tags=[ApiTag.RELATED_TABLE],
        manual_parameters=[],
        request_body=RelatedTableApiSerializer.
        Meta.swagger_schema_fields['post_body'],
        operation_description='Update a related table.'
    )
    def update(self, request, *args, **kwargs):
        """Update an existing related table."""
        instance = self.get_object()
        edit_permission_resource(instance, request.user)
        serializer = self._get_valid_serializer_or_throw(request, instance)
        serializer.save()
        return Response(self.get_serializer(instance).data)

    @swagger_auto_schema(
        operation_id='related-table-partial-update',
        tags=[ApiTag.RELATED_TABLE]
    )
    def partial_update(self, request, *args, **kwargs):
        """Update an existing related table."""
        raise MethodNotAllowed('PATCH')

    @swagger_auto_schema(
        operation_id='related-table-delete',
        tags=[ApiTag.RELATED_TABLE],
        manual_parameters=[],
        operation_description='Delete a related table.'
    )
    def destroy(self, request, *args, **kwargs):
        """Delete an existing related table."""
        return super().destroy(request, *args, **kwargs)

    def _get_valid_serializer_or_throw(self, request, instance=None):
        """Get an already validated serializer."""
        serializer = self.get_serializer(instance, data=request.data)
        if not serializer.is_valid():
            raise ParseError(serializer.errors.items())
        return serializer
