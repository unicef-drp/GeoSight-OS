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

from geosight.data.models.code import Code, CodeList


class CodeSerializer(serializers.ModelSerializer):
    """Serializer for Code."""

    value = serializers.SerializerMethodField()

    def get_value(self, obj: Code):
        """Return value."""
        return obj.id

    class Meta:  # noqa: D106
        model = Code
        fields = ('id', 'value', 'label', 'code')
        swagger_schema_fields = {
            'type': openapi.TYPE_OBJECT,
            'title': 'Code',
            'properties': {
                'name': openapi.Schema(
                    title='Name',
                    type=openapi.TYPE_STRING
                ),
                'description': openapi.Schema(
                    title='Description',
                    type=openapi.TYPE_STRING
                ),
                'value': openapi.Schema(
                    title='Value',
                    type=openapi.TYPE_STRING
                ),
            },
            'example': {
                "id": 1,
                "name": 'Code name 1',
                "description": "Description",
                "value": 'TEST',
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
                    'value': openapi.Schema(
                        title='Value',
                        type=openapi.TYPE_STRING
                    ),
                }
            )
        }


class CodeListSerializer(serializers.ModelSerializer):
    """Serializer for Code."""

    codes = serializers.SerializerMethodField()

    def get_codes(self, obj: CodeList):
        """Codes."""
        return obj.codes

    class Meta:  # noqa: D106
        model = CodeList
        fields = '__all__'
        swagger_schema_fields = {
            'type': openapi.TYPE_OBJECT,
            'title': 'Code',
            'properties': {
                'name': openapi.Schema(
                    title='Name',
                    type=openapi.TYPE_STRING
                ),
                'description': openapi.Schema(
                    title='Description',
                    type=openapi.TYPE_STRING
                ),
                'codes': openapi.Schema(
                    title='Codes',
                    type=openapi.TYPE_ARRAY,
                    items=openapi.Items(
                        type=openapi.TYPE_OBJECT,
                        properties={
                            'id': openapi.Schema(
                                title='Code id',
                                type=openapi.TYPE_NUMBER,
                            ),
                            'name': openapi.Schema(
                                title='Code name',
                                type=openapi.TYPE_STRING
                            ),
                            'value': openapi.Schema(
                                title='Code value',
                                type=openapi.TYPE_STRING
                            ),
                        }
                    )
                ),
            },
            'example': {
                'name': 'TEST',
                'description': 'Description',
                'codes': [{'id': 1, 'name': 'testcode', 'value': 'yes'}]
            },
            'post_body': openapi.Schema(
                description='Data that is needed to create/edit codelist.',
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
                    'codes': openapi.Schema(
                        title='Codes',
                        type=openapi.TYPE_ARRAY,
                        items=openapi.Items(
                            type=openapi.TYPE_OBJECT,
                            properties={
                                'id': openapi.Schema(
                                    title='Code id',
                                    type=openapi.TYPE_NUMBER,
                                ),
                                'name': openapi.Schema(
                                    title='Code name',
                                    type=openapi.TYPE_STRING
                                ),
                                'value': openapi.Schema(
                                    title='Code value',
                                    type=openapi.TYPE_STRING
                                ),
                            }
                        )
                    ),
                }
            )
        }


class CodeListDetailSerializer(serializers.ModelSerializer):
    """Serializer for Code."""

    codes = serializers.SerializerMethodField()

    def get_codes(self, obj: CodeList):
        """Codes."""
        return obj.codes

    class Meta:  # noqa: D106
        model = CodeList
        fields = '__all__'
        swagger_schema_fields = {
            'type': openapi.TYPE_OBJECT,
            'title': 'Code',
            'properties': {
                'id': openapi.Schema(
                    title='ID',
                    type=openapi.TYPE_NUMBER
                ),
                'name': openapi.Schema(
                    title='Name',
                    type=openapi.TYPE_STRING
                ),
                'description': openapi.Schema(
                    title='Description',
                    type=openapi.TYPE_STRING
                ),
                'codes': openapi.Schema(
                    title='Codes',
                    type=openapi.TYPE_ARRAY,
                    items=openapi.Items(
                        type=openapi.TYPE_OBJECT,
                        properties={
                            'id': openapi.Schema(
                                title='Code id',
                                type=openapi.TYPE_NUMBER,
                            ),
                            'name': openapi.Schema(
                                title='Code name',
                                type=openapi.TYPE_STRING
                            ),
                            'value': openapi.Schema(
                                title='Code value',
                                type=openapi.TYPE_STRING
                            ),
                        }
                    )
                ),
            },
            'example': {
                'id': 1,
                'name': 'TEST',
                'description': 'Description',
                'codes': [{'id': 1, 'name': 'testcode', 'value': 'yes'}]
            },
            'post_body': openapi.Schema(
                description='Data that is needed to create/edit codelist.',
                type=openapi.TYPE_OBJECT,
                properties={
                    'id': openapi.Schema(
                        title='ID',
                        type=openapi.TYPE_NUMBER
                    ),
                    'name': openapi.Schema(
                        title='Name',
                        type=openapi.TYPE_STRING
                    ),
                    'description': openapi.Schema(
                        title='Description',
                        type=openapi.TYPE_STRING
                    ),
                    'codes': openapi.Schema(
                        title='Codes',
                        type=openapi.TYPE_ARRAY,
                        items=openapi.Items(
                            type=openapi.TYPE_OBJECT,
                            properties={
                                'id': openapi.Schema(
                                    title='Code id',
                                    type=openapi.TYPE_NUMBER,
                                ),
                                'name': openapi.Schema(
                                    title='Code name',
                                    type=openapi.TYPE_STRING
                                ),
                                'value': openapi.Schema(
                                    title='Code value',
                                    type=openapi.TYPE_STRING
                                ),
                            }
                        )
                    ),
                }
            )
        }
