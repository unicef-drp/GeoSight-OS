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
from geosight.data.serializer.resource import ResourceSerializer

from geosight.data.models.code import Code, CodeList, CodeInCodeList


class CodeSerializer(serializers.ModelSerializer):
    """Serializer for Code."""

    id = serializers.IntegerField(read_only=True)
    value = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()

    def get_value(self, obj: Code):
        """Return value."""
        return obj.value

    def get_name(self, obj: Code):
        """Return name."""
        return obj.name

    def to_internal_value(self, data):
        """Ensure all field stays in validated_data."""
        return data

    def create(self, validated_data):
        """Create a new code."""
        code_data = self.validated_data
        code, _ = Code.objects.get_or_create(
            name=code_data.get("name"),
            value=code_data.get("value"),
            description=code_data.get("description")
        )
        code_list_pk = self.context['code_list_pk']
        order = CodeInCodeList.objects.filter(
            codelist_id=code_list_pk
        ).order_by('order').last().order + 1
        CodeInCodeList.objects.get_or_create(
            codelist_id=code_list_pk,
            code=code,
            defaults={
                'order': order,
            }
        )
        return code

    class Meta:  # noqa: D106
        model = Code
        fields = ('id', 'name', 'description', 'value')
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
            }
        }
        post_body = openapi.Schema(
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


class CodeListSerializer(ResourceSerializer):
    """Serializer for Code."""

    codes = CodeSerializer(many=True)

    def to_internal_value(self, data):
        """Ensure `codes` stays in validated_data."""
        codes_data = data.get("codes", [])  # Extract codes manually
        validated_data = super(
            CodeListSerializer, self
        ).to_internal_value(data)
        validated_data["codes"] = codes_data  # Reattach codes
        return validated_data

    def create(self, validated_data):
        """Create a CodeList and assign Codes."""
        codes_data = validated_data.pop("codes", [])
        codelist = CodeList.objects.create(**validated_data)

        # Create or assign codes
        for idx, code_data in enumerate(codes_data):
            code, _ = Code.objects.get_or_create(
                name=code_data.get("name"),
                value=code_data.get("value"),
                description=code_data.get("description")
            )
            CodeInCodeList.objects.create(
                codelist=codelist, code=code, order=idx
            )

        return codelist

    class Meta:  # noqa: D106
        model = CodeList
        fields = ('id', 'name', 'description', 'codes')
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
            }
        }
        post_body = openapi.Schema(
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
                            'name': openapi.Schema(
                                title='Code name',
                                type=openapi.TYPE_STRING
                            ),
                            'description': openapi.Schema(
                                title='Code description',
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
