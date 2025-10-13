"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""
__author__ = 'Irwan Fathurrahman'
__date__ = '10/10/2025'
__copyright__ = ('Copyright 2025, Unicef')

from cloud_native_gis.serializer.layer import LayerAttributeSerializer
from drf_yasg.utils import swagger_auto_schema

from core.api_utils import common_api_params, ApiTag
from core.serializer.dynamic_serializer import DynamicModelSerializer
from geosight.data.api.v1.context_layer.detail.base_detail import (
    ContextBaseDetailDataView
)
from geosight.data.models import LayerType


class DynamicLayerAttributeSerializer(
    LayerAttributeSerializer, DynamicModelSerializer):
    """Dynamic Layer Attribute Serializer."""
    pass


class ContextLayerAttributesViewSet(ContextBaseDetailDataView):
    """Context Layer Data ViewSet."""

    non_filtered_keys = ['page', 'page_size']

    def get_serializer_class(self):
        obj = self._get_object()
        if obj.layer_type == LayerType.CLOUD_NATIVE_GIS_LAYER:
            return DynamicLayerAttributeSerializer
        return None

    @property
    def queryset(self):
        """
        Return the filtered queryset for the API view.

        This method retrieves the base queryset and filters it
        by the current context layer's ID.

        :return: A queryset filtered by indicator_id.
        :rtype: QuerySet
        """
        obj = self._get_object()
        if obj.layer_type == LayerType.CLOUD_NATIVE_GIS_LAYER:
            layer = self.get_context_layer_object()
            return layer.layerattributes_set.all()
        raise ValueError("Invalid layer type for this request.")

    @swagger_auto_schema(
        operation_id='context-layer-attribute-list',
        tags=[ApiTag.CONTEXT_LAYER],
        manual_parameters=[
            *common_api_params
        ],
        operation_description=(
                'Return attributes of accessed context layer for the user.'
                'Specifically for cloud native layer.'
        )
    )
    def list(self, request, *args, **kwargs):  # noqa DOC110, DOC103
        """
        Retrieve a list of attributes of context layer.
        Specifically for cloud native layer.

        :param request: The HTTP request object.
        :type request: rest_framework.request.Request
        :param args: Additional positional arguments.
        :param kwargs: Additional keyword arguments.
        :return: Response containing a list of indicator rows.
        :rtype: rest_framework.response.Response
        """
        return super().list(request, *args, **kwargs)

    @swagger_auto_schema(auto_schema=None)
    def retrieve(self, request, id=None):
        """Return detailed of context layer."""
        return super().retrieve(request, id)
