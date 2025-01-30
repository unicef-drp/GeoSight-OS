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
__date__ = '04/12/2023'
__copyright__ = ('Copyright 2023, Unicef')

from drf_yasg.utils import swagger_auto_schema
from rest_framework import status, viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

from core.api_utils import ApiTag
from core.api_utils import common_api_params, ApiParams
from core.pagination import Pagination
from core.permissions import AdminAuthenticationPermission
from geosight.data.models.code import CodeList
from geosight.data.serializer.code import CodeListSerializer, CodeSerializer


class CodeListViewSet(
    viewsets.ModelViewSet
):
    """Code view set."""

    model_class = CodeList
    serializer_class = CodeListSerializer
    extra_exclude_fields = ['parameters']
    queryset = CodeList.objects.all()
    pagination_class = Pagination

    def get_permissions(self):
        """Dynamically assign permission classes."""
        if self.action in ['create', 'codes']:
            return [AdminAuthenticationPermission()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        """Get queryset based on query parameters."""
        param = self.request.query_params.get('name__contains')
        if param:
            return self.queryset.filter(name__icontains=param)
        return self.queryset

    @swagger_auto_schema(
        operation_id=' codelist-list',
        tags=[ApiTag.CODE_LIST],
        manual_parameters=[
            *common_api_params,
            ApiParams.NAME_CONTAINS
        ],
        operation_description='Return list of code list.'
    )
    def list(self, request, *args, **kwargs):
        """List of basemap."""
        return super().list(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_id='codelist-create',
        tags=[ApiTag.CODE_LIST],
        manual_parameters=[],
        request_body=CodeListSerializer.
        Meta.post_body,
        operation_description='Create a code list.',
    )
    def create(self, request, *args, **kwargs):
        """Create a code."""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

    @swagger_auto_schema(
        operation_id='codelist-code-add',
        tags=[ApiTag.CODE_LIST],
        manual_parameters=[],
        operation_description='List dashboard groups.',
        request_body=CodeSerializer.Meta.post_body,
        permission_classes = [AdminAuthenticationPermission]
    )
    @action(detail=True, methods=['post'])
    def codes(self, request, pk):
        """Return dashboard group list."""
        serializer = CodeSerializer(
            data=request.data, context={'code_list_pk': pk}
        )
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )
