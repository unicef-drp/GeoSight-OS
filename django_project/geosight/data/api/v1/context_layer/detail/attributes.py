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
        """
        Return the serializer class for the current context layer.

        If the context layer is of type ``CLOUD_NATIVE_GIS_LAYER``,
        it returns ``DynamicLayerAttributeSerializer``; otherwise, ``None``.

        :return: Serializer class for the current context layer.
        :rtype: rest_framework.serializers.Serializer or None
        """
        obj = self._get_object()
        if obj.layer_type == LayerType.CLOUD_NATIVE_GIS_LAYER:
            return DynamicLayerAttributeSerializer
        return None

    @property
    def queryset(self):
        """
        Return the filtered queryset for the API view.

        This method retrieves the related attributes for the current
        context layer, restricted to cloud-native GIS layers.

        :return: Queryset of layer attributes.
        :rtype: django.db.models.QuerySet
        :raises ValueError: If the layer type is invalid for this request.
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
        Retrieve a list of attributes for the specified context layer.

        This method handles ``GET`` requests and returns the attribute
        definitions associated with a cloud-native GIS context layer.

        :param request: The HTTP request object.
        :type request: rest_framework.request.Request
        :param args: Additional positional arguments.
        :param kwargs: Additional keyword arguments.
        :return: Paginated response containing attribute definitions.
        :rtype: rest_framework.response.Response
        """
        return super().list(request, *args, **kwargs)

    @swagger_auto_schema(auto_schema=None)
    def retrieve(self, request, id=None):
        """
        Retrieve detailed information for a specific context layer attribute.

        This endpoint is disabled and always defers
        to the base class implementation.

        :param request: The HTTP request object.
        :type request: rest_framework.request.Request
        :param id: Identifier of the attribute object.
        :type id: int or str, optional
        :return: Response as defined in the parent implementation.
        :rtype: rest_framework.response.Response
        """
        return super().retrieve(request, id)
