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
from rest_framework import serializers

from core.serializer.dynamic_serializer import DynamicModelSerializer
from geosight.data.models.related_table import (
    RelatedTable, RelatedTableRow, RelatedTableField
)


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
            'related-tables-detail',
            args=[obj.id]
        )

    def get_creator(self, obj: RelatedTable):  # noqa: D102
        return obj.creator.get_full_name() if obj.creator else None

    class Meta:  # noqa: D106
        model = RelatedTable
        exclude = ('unique_id',)


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
