from drf_yasg.openapi import Response
from drf_yasg.utils import swagger_auto_schema
from rest_framework.exceptions import MethodNotAllowed

from core.api_utils import ApiTag
from geosight.data.api.v1.base import BaseApiV1Resource
from geosight.data.models import RelatedTable
from geosight.data.serializer.related_table import RelatedTableApiSerializer


class RelatedTableViewSet(BaseApiV1Resource):
    model_class = RelatedTable
    serializer_class = RelatedTableApiSerializer
    extra_exclude_fields = []
    pagination_class = None

    @swagger_auto_schema(
        operation_id='related-tables-get',
        tags=[ApiTag.RELATED_TABLES],
        operation_description='Return list of accessible related tables for the user.',
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

    @swagger_auto_schema(operation_id='related-tables-get', tags=[ApiTag.RELATED_TABLES])
    def retrieve(self, request, *args, **kwargs):
        raise MethodNotAllowed('GET')

    @swagger_auto_schema(operation_id='related-tables-create', tags=[ApiTag.RELATED_TABLES])
    def create(self, request, *args, **kwargs):
        raise MethodNotAllowed('POST')

    @swagger_auto_schema(operation_id='related-tables-update', tags=[ApiTag.RELATED_TABLES])
    def update(self, request, *args, **kwargs):
        raise MethodNotAllowed('PUT')

    @swagger_auto_schema(operation_id='related-tables-partial_update', tags=[ApiTag.RELATED_TABLES])
    def partial_update(self, request, *args, **kwargs):
        raise MethodNotAllowed('PATCH')

    @swagger_auto_schema(operation_id='related-tables-delete', tags=[ApiTag.RELATED_TABLES])
    def destroy(self, request, *args, **kwargs):
        raise MethodNotAllowed('DELETE')
