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

from drf_yasg import openapi
from rest_framework import serializers

from geosight.data.models.basemap_layer import (
    BasemapLayerParameter, BasemapLayer, BasemapLayerType
)
from geosight.data.serializer.resource import ResourceSerializer

TYPES = [BasemapLayerType.XYZ_TILE, BasemapLayerType.WMS]


class BasemapLayerSerializer(ResourceSerializer):
    """Serializer for BasemapLayer."""

    category = serializers.SerializerMethodField()
    parameters = serializers.SerializerMethodField()
    permission = serializers.SerializerMethodField()

    def get_category(self, obj: BasemapLayer):
        """Return category."""
        return obj.category

    def get_parameters(self, obj: BasemapLayer):
        """Return parameters."""
        urls = obj.url.split('?')
        parameters = {}

        for parameter in obj.basemaplayerparameter_set.all():
            value = parameter.value
            try:
                value = float(value)
            except ValueError:
                pass
            parameters[parameter.name] = value

        if len(urls) > 1:
            for param in urls[1].split('&'):
                params = param.split('=')
                if params[0].lower() != 'bbox':
                    parameters[params[0]] = '='.join(params[1:])
        return parameters

    def get_permission(self, obj: BasemapLayer):
        """Return permission."""
        return obj.permission.all_permission(
            self.context.get('user', None)
        )

    class Meta:  # noqa: D106
        model = BasemapLayer
        fields = '__all__'
        swagger_schema_fields = {
            'type': openapi.TYPE_OBJECT,
            'title': 'BasemapLayer',
            'properties': {
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
                    type=openapi.TYPE_STRING
                ),
                'icon': openapi.Schema(
                    title='Icon',
                    type=openapi.TYPE_STRING
                ),
                'created_at': openapi.Schema(
                    title='Created at',
                    type=openapi.TYPE_STRING
                ),
                'created_by': openapi.Schema(
                    title='Creator',
                    type=openapi.TYPE_STRING
                ),
                'permission': openapi.Schema(
                    title='Permission',
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'list': openapi.Schema(
                            title='List',
                            type=openapi.TYPE_BOOLEAN
                        ),
                        'read': openapi.Schema(
                            title='Read',
                            type=openapi.TYPE_BOOLEAN
                        ),
                        'edit': openapi.Schema(
                            title='Edit',
                            type=openapi.TYPE_BOOLEAN
                        ),
                        'share': openapi.Schema(
                            title='Share',
                            type=openapi.TYPE_BOOLEAN
                        ),
                        'delete': openapi.Schema(
                            title='Delete',
                            type=openapi.TYPE_BOOLEAN
                        ),
                    }
                ),
            },
            'example': {
                "id": 1,
                "category": 'TEST',
                "created_by": 'Admin',
                "created_at": "2023-01-01T00:00:00.00000Z",
                "permission": {
                    "list": True,
                    "read": True,
                    "edit": True,
                    "share": True,
                    "delete": True
                },
                "name": 'Basemap name 1',
                "description": "Description",
                "icon": "http://localhost:2000/media/icons/icon.png",
                "url": (
                    "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
                ),
                "type": "XYZ",
            },
            'post_body': openapi.Schema(
                description='Data that is needed to create/edit basemap.',
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
                }
            )
        }


class BasemapLayerParameterSerializer(serializers.ModelSerializer):
    """Serializer for BasemapLayerParameter."""

    class Meta:  # noqa: D106
        model = BasemapLayerParameter
        fields = '__all__'
