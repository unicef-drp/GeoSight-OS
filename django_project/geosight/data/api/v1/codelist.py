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

from geosight.data.forms.style import BaseStyleForm
from geosight.data.models.code import Code, CodeList
from geosight.data.serializer.code import CodeListSerializer, CodeListDetailSerializer
from rest_framework.viewsets import mixins, GenericViewSet
from .base import BaseApiV1


class CodeListViewSet(
    BaseApiV1,
    mixins.CreateModelMixin,
    GenericViewSet
):
    """Code view set."""

    model_class = CodeList
    form_class = BaseStyleForm
    serializer_class = CodeListSerializer
    extra_exclude_fields = ['parameters']

    @swagger_auto_schema(
        operation_id='codelist-create',
        manual_parameters=[],
        request_body=CodeListSerializer.
        Meta.swagger_schema_fields['post_body'],
        operation_description='Create a code list.'
    )
    def create(self, request, *args, **kwargs):
        """Create a code."""
        return super().create(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_id='codelist-update',
        manual_parameters=[],
        request_body=CodeListDetailSerializer.
        Meta.swagger_schema_fields['post_body'],
        operation_description='Update a code list.'
    )
    def update(self, request, id, *args, **kwargs):
        """Update detailed of basemap."""
        return super().update(request, id=id, *args, **kwargs)

