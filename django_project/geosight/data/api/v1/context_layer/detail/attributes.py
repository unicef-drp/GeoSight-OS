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
from rest_framework import serializers

from core.api_utils import common_api_params, ApiTag
from core.serializer.dynamic_serializer import DynamicModelSerializer
from geosight.data.api.v1.context_layer.detail.base_detail import (
    ContextBaseDetailDataView
)
from geosight.data.models import LayerType
from geosight.data.models.related_table import RelatedTableField


class DynamicLayerAttributeSerializer(
    LayerAttributeSerializer, DynamicModelSerializer):
    """Dynamic Layer Attribute Serializer.

    Combines :class:`LayerAttributeSerializer` with
    :class:`DynamicModelSerializer` to support dynamic field selection
    for cloud-native GIS layer attributes.
    """

    pass


class RelatedTableFieldAttributeSerializer(DynamicModelSerializer):
    """Serializer for RelatedTableField mapped to LayerAttributes format.

    Maps :class:`~geosight.data.models.related_table.RelatedTableField`
    fields to the same structure used by
    :class:`~cloud_native_gis.serializer.layer.LayerAttributeSerializer`
    for consistency across layer types.
    """

    attribute_name = serializers.CharField(source='name')
    attribute_label = serializers.CharField(source='alias', allow_null=True)
    attribute_type = serializers.CharField(source='type')
    attribute_description = serializers.SerializerMethodField()
    attribute_order = serializers.IntegerField(source='id')

    def get_attribute_description(self, obj):
        """Return None for attribute_description.

        :param obj: The :class:`RelatedTableField` instance being serialized.
        :type obj: geosight.data.models.related_table.RelatedTableField
        :return: Always ``None``; description is not available for this type.
        :rtype: None
        """
        return None

    class Meta:  # noqa: D106
        model = RelatedTableField
        fields = [
            'id', 'attribute_name', 'attribute_type',
            'attribute_label', 'attribute_description', 'attribute_order'
        ]


class ContextLayerAttributesViewSet(ContextBaseDetailDataView):
    """ViewSet for listing attributes of a context layer.

    Supports both ``CLOUD_NATIVE_GIS_LAYER`` and ``RELATED_TABLE`` layer
    types, returning their attribute definitions in a unified format.

    :cvar non_filtered_keys: Query parameters excluded from attribute
        filtering.
    :vartype non_filtered_keys: list[str]
    """

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
        if obj.layer_type == LayerType.RELATED_TABLE:
            return RelatedTableFieldAttributeSerializer
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
        layer = self.get_context_layer_object()
        if obj.layer_type == LayerType.CLOUD_NATIVE_GIS_LAYER:
            return layer.layerattributes_set.all()
        elif obj.layer_type == LayerType.RELATED_TABLE:
            return layer.fields_definition_query
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
