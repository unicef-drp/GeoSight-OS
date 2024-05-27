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

from django.shortcuts import reverse
from drf_yasg import openapi
from rest_framework import serializers
from rest_framework.fields import JSONField

from core.serializer.dynamic_serializer import DynamicModelSerializer
from geosight.data.models.related_table import (
    RelatedTable, RelatedTableRow, RelatedTableField
)


def _string_field(name: str, read_only: bool = False) -> openapi.Schema:
    return openapi.Schema(
        title=name, type=openapi.TYPE_STRING, read_only=read_only
    )


_related_table_swagger_properties = {
    'id': openapi.Schema(
        title='Id',
        type=openapi.TYPE_INTEGER,
        read_only=True
    ),
    'name': _string_field('Name'),
    'fields_definition': openapi.Schema(
        title='Fields definition',
        type=openapi.TYPE_ARRAY,
        items=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'name': _string_field('Field name'),
                'label': _string_field('Field label'),
                'type': openapi.Schema(
                    title='Field type',
                    type=openapi.TYPE_STRING,
                    pattern="date | number | string"
                )
            }
        )
    ),
    'description': _string_field('Description'),
    'url': _string_field('Url', read_only=True),
    'creator': _string_field('Creator', read_only=True),
    'created_at': _string_field('Created at', read_only=True),
    'modified_at': _string_field('Created at', read_only=True),
}

_related_table_row_swagger_properties = {
    'id': openapi.Schema(
        title='Id',
        type=openapi.TYPE_INTEGER,
        read_only=True
    ),
    'properties': openapi.Schema(
        title='Row values',
        description='Keys are field names from fields_definition '
                    'in the associated related table',
        type=openapi.TYPE_OBJECT
    )
}


class RelatedTableFieldApiSerializer(DynamicModelSerializer):
    """Serializer for RelatedTableField."""

    label = serializers.CharField(source='alias')

    class Meta:  # noqa: D106
        model = RelatedTableField
        fields = ('name', 'label', 'type')


class RelatedTableApiSerializer(DynamicModelSerializer):
    """Serializer for RelatedTable."""

    url = serializers.SerializerMethodField()
    creator = serializers.SerializerMethodField()
    fields_definition = RelatedTableFieldApiSerializer(many=True)

    def get_url(self, obj: RelatedTable):  # noqa: D102
        return reverse(
            'related_tables-detail',
            args=[obj.id]
        )

    def get_creator(self, obj: RelatedTable):  # noqa: D102
        return obj.creator.get_full_name() if obj.creator else None

    def create(self, validated_data):  # noqa: D102
        fields = validated_data['fields_definition']
        data = validated_data.copy()
        del data['fields_definition']
        table = RelatedTable(**data)
        table.save()
        for definition in fields:
            table.add_field(definition['name'],
                            definition['alias'], definition['type'])
        return table

    class Meta:  # noqa: D106
        model = RelatedTable
        exclude = ('unique_id',)

        swagger_schema_fields = {
            'type': openapi.TYPE_OBJECT,
            'title': 'RelatedTable',
            'required': ['name', 'fields_definition'],
            'properties': _related_table_swagger_properties,
            'example': {
                "id": 1,
                "name": 'My related table',
                "fields_definition": [{
                    "name": "field_1",
                    "label": "Field 1",
                    "type": "string",
                }, {
                    "name": "field_2",
                    "label": "Field 2",
                    "type": "date",
                }, {
                    "name": "field_3",
                    "label": "Field 3",
                    "type": "number",
                }],
                "description": "A related table for testing apidocs",
                "url": "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
                "creator": 'Admin',
                "created_at": "2023-01-01T00:00:00.00000Z",
                "modified_at": "2023-01-01T00:00:00.00000Z",
            },
            'post_body': openapi.Schema(
                description='Data needed to create/edit related tables.',
                type=openapi.TYPE_OBJECT,
                properties=_related_table_swagger_properties
            )
        }


class RelatedTableRowApiSerializer(DynamicModelSerializer):
    """Serializer for RelatedTableRow."""

    properties = JSONField(required=True, source='data')

    class Meta:  # noqa: D106
        model = RelatedTableRow
        exclude = ('table', 'order', 'data')

        swagger_schema_fields = {
            'type': openapi.TYPE_OBJECT,
            'title': 'RelatedTableRow',
            'required': ['properties'],
            'properties': _related_table_row_swagger_properties,
            'example': {
                "id": 1,
                "properties": {
                    "field_1": "value_1",
                    "field_2": "2024-02-14T00:00:00Z",
                    "field_3": 42.7
                }
            },
            'post_body': openapi.Schema(
                description='Data needed to create/edit related table rows.',
                type=openapi.TYPE_OBJECT,
                properties=_related_table_row_swagger_properties
            )
        }


class RelatedTableRowApiFlatSerializer(DynamicModelSerializer):
    """Serializer for RelatedTableRow."""

    class Meta:  # noqa: D106
        model = RelatedTableRow
        fields = ('id',)

    def to_representation(self, instance):
        """Update custom data."""
        data = super(RelatedTableRowApiFlatSerializer, self).to_representation(
            instance
        )
        data.update(instance.data)
        return data


class RelatedTableSerializer(DynamicModelSerializer):
    """
    DEPRECATED: Legacy serializer.

    To be replaced with RelatedTableApiSerializer Serializer for RelatedTable.
    """

    url = serializers.SerializerMethodField()
    creator = serializers.SerializerMethodField()
    rows = serializers.SerializerMethodField()
    fields_definition = serializers.SerializerMethodField()
    related_fields = serializers.SerializerMethodField()
    permission = serializers.SerializerMethodField()
    version_data = serializers.SerializerMethodField()

    def get_url(self, obj: RelatedTable):
        """Return url."""
        return reverse(
            'related-table-data-api',
            args=[obj.id]
        )

    def get_creator(self, obj: RelatedTable):
        """Return value."""
        if obj.creator:
            return obj.creator.get_full_name()
        else:
            return ''

    def get_rows(self, obj: RelatedTable):
        """Return value."""
        return obj.data

    def get_fields_definition(self, obj: RelatedTable):
        """Return fields_definition."""
        return obj.fields_definition

    def get_related_fields(self, obj: RelatedTable):
        """Return related_fields."""
        return obj.related_fields

    def get_permission(self, obj: RelatedTable):
        """Return permission."""
        return obj.permission.all_permission(
            self.context.get('user', None)
        )

    def get_version_data(self, obj: RelatedTable):
        """Return permission."""
        return obj.version

    class Meta:  # noqa: D106
        model = RelatedTable
        exclude = ()


class RelatedTableRowSerializer(DynamicModelSerializer):
    """Serializer for RelatedTableRow."""

    class Meta:  # noqa: D106
        model = RelatedTableRow
        exclude = ('table', 'data')


class RelatedTableFieldSerializer(DynamicModelSerializer):
    """Serializer for Related table field."""

    example = serializers.SerializerMethodField()

    def get_example(self, obj: RelatedTableField):
        """Return example."""
        example = []
        example_data = self.context.get('example_data', None)
        if example_data:
            for data in example_data:
                try:
                    example.append(data.data[obj.name])
                except (KeyError, AttributeError):
                    pass
        return example

    class Meta:  # noqa: D106
        model = RelatedTableField
        exclude = ('id', 'related_table')
