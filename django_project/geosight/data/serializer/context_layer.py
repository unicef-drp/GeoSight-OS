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
__date__ = '13/06/2023'
__copyright__ = ('Copyright 2023, Unicef')

import json
import urllib.parse

from drf_yasg import openapi
from rest_framework import serializers

from geosight.data.models.context_layer import (
    ContextLayer, ContextLayerField, LayerType
)
from geosight.data.serializer.resource import ResourceSerializer

TYPES = [
    LayerType.ARCGIS, LayerType.GEOJSON, LayerType.RASTER_COG,
    LayerType.RASTER_TILE, LayerType.VECTOR_TILE, LayerType.RELATED_TABLE,
    LayerType.CLOUD_NATIVE_GIS_LAYER
]


class ContextLayerSerializer(ResourceSerializer):
    """Serializer for ContextLayer."""

    url = serializers.SerializerMethodField()
    parameters = serializers.SerializerMethodField()
    styles = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()
    data_fields = serializers.SerializerMethodField()
    label_styles = serializers.SerializerMethodField()
    permission = serializers.SerializerMethodField()
    original_styles = serializers.SerializerMethodField()
    original_configuration = serializers.SerializerMethodField()
    configuration = serializers.SerializerMethodField()

    def get_url(self, obj: ContextLayer):
        """
        Extract and return the base URL of the layer.

        :param obj: Context layer instance.
        :type obj: ContextLayer
        :return: Base URL without query parameters.
        :rtype: str or None
        """
        return urllib.parse.unquote(obj.url.split('?')[0]) if obj.url else None

    def get_parameters(self, obj: ContextLayer):
        """
        Extract URL query parameters (excluding 'bbox') from the layer URL.

        :param obj: Context layer instance.
        :type obj: ContextLayer
        :return: Dictionary of URL parameters.
        :rtype: dict
        """
        parameters = {}
        if obj.url:
            urls = obj.url.split('?')
            if len(urls) > 1:
                for param in urls[1].split('&'):
                    params = param.split('=')
                    if params[0].lower() != 'bbox':
                        parameters[params[0]] = '='.join(params[1:])
        return parameters

    def get_category(self, obj: ContextLayer):
        """
        Retrieve the name of the category (group) the layer belongs to.

        :param obj: Context layer instance.
        :type obj: ContextLayer
        :return: Group name if available, otherwise an empty string.
        :rtype: str
        """
        return obj.group.name if obj.group else ''

    def get_data_fields(self, obj: ContextLayer):
        """
        Retrieve data fields for the context layer.

        For related tables, returns field definitions if none exist.

        :param obj: Context layer instance.
        :type obj: ContextLayer
        :return: List of serialized field data.
        :rtype: list
        """
        fields = ContextLayerFieldSerializer(
            obj.contextlayerfield_set.all(), many=True
        ).data
        if obj.layer_type == LayerType.RELATED_TABLE and obj.related_table:
            if not fields:
                fields = obj.related_table.fields_definition
        return fields

    def get_styles(self, obj: ContextLayer):
        """
        Deserialize and return the styles configuration.

        :param obj: Context layer instance.
        :type obj: ContextLayer
        :return: Styles as a dictionary or None.
        :rtype: dict or None
        """
        return json.loads(obj.styles) if obj.styles else None

    def get_original_styles(self, obj: ContextLayer):
        """
        Return the original styles of the context layer.

        :param obj: Context layer instance.
        :type obj: ContextLayer
        :return: Original styles as a dictionary or None.
        :rtype: dict or None
        """
        return json.loads(obj.styles) if obj.styles else None

    def get_label_styles(self, obj: ContextLayer):
        """
        Retrieve label styles configuration.

        :param obj: Context layer instance.
        :type obj: ContextLayer
        :return: Label styles dictionary.
        :rtype: dict
        """
        return json.loads(obj.label_styles) if obj.label_styles else {}

    def get_permission(self, obj: ContextLayer):
        """
        Retrieve permissions for the context layer based on the current user.

        :param obj: Context layer instance.
        :type obj: ContextLayer
        :return: Permissions information.
        :rtype: dict
        """
        return obj.permission.all_permission(
            self.context.get('user', None)
        )

    def get_configuration(self, obj: ContextLayer):
        """
        Retrieve the current configuration of the context layer.

        :param obj: Context layer instance.
        :type obj: ContextLayer
        :return: Configuration dictionary or None.
        :rtype: dict or None
        """
        if not obj.configuration:
            return None
        if isinstance(obj.configuration, str):
            return json.loads(obj.configuration)
        return obj.configuration

    def get_original_configuration(self, obj: ContextLayer):
        """
        Retrieve the original configuration of the context layer.

        :param obj: Context layer instance.
        :type obj: ContextLayer
        :return: Original configuration dictionary or None.
        :rtype: dict or None
        """
        if not obj.configuration:
            return None
        if isinstance(obj.configuration, str):
            return json.loads(obj.configuration)
        return obj.configuration

    class Meta:  # noqa: D106
        model = ContextLayer
        fields = '__all__'
        post_body = openapi.Schema(
            description='Data that is needed to create/edit context layer.',
            type=openapi.TYPE_OBJECT,
            properties={
                'name': openapi.Schema(
                    title='Name',
                    type=openapi.TYPE_STRING
                ),
                'description': openapi.Schema(
                    title='Description',
                    type=openapi.TYPE_STRING
                ),
                'category': openapi.Schema(
                    title='Category',
                    type=openapi.TYPE_STRING
                ),
                'url': openapi.Schema(
                    title='Url',
                    type=openapi.TYPE_STRING
                ),
                'type': openapi.Schema(
                    title='Type',
                    type=openapi.TYPE_STRING,
                    description=(
                        f'The choices are {[TYPES]}'
                    )
                ),
                'styles': openapi.Schema(
                    title='Styles',
                    type=openapi.TYPE_OBJECT,
                    description=(
                        f'String of JSON containing style configuration. '
                        f'The styles are simply a '
                        f'list of layers in a Mapbox style.'
                    )
                ),
            },
            example={
                "name": "Somalia healthsites",
                "description": "",
                "layer_type": "Cloud Native GIS Layer",
                "category": "Test",
                "styles": [
                    {
                        "id": "1",
                        "type": "circle",
                        "paint": {
                            "circle-color": "#98F194",
                            "circle-radius": 6,
                            "circle-opacity": 1,
                            "circle-stroke-width": 1
                        },
                        "source": "00000000-0000-0000-0000-000000000000",
                        "source-layer": "default"
                    },
                    {
                        "id": "2",
                        "type": "circle",
                        "paint": {
                            "circle-color": "#88005C",
                            "circle-radius": 6,
                            "circle-opacity": 1,
                            "circle-stroke-width": 1
                        },
                        "source": "00000000-0000-0000-0000-000000000000",
                        "source-layer": "default"
                    },

                ]
            }
        )


class ContextLayerFieldSerializer(serializers.ModelSerializer):
    """Serializer for ContextLayerField."""

    class Meta:  # noqa: D106
        model = ContextLayerField
        fields = '__all__'
