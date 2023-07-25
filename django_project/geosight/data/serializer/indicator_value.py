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

from rest_framework import serializers

from geosight.data.models.indicator import IndicatorValue
from geosight.georepo.models.entity import Entity


class IndicatorValueSerializer(serializers.ModelSerializer):
    """Serializer for IndicatorValue."""

    indicator = serializers.SerializerMethodField()
    value = serializers.SerializerMethodField()

    def get_indicator(self, obj: IndicatorValue):
        """Return indicator name."""
        return obj.indicator.__str__()

    def get_value(self, obj: IndicatorValue):
        """Return value of indicator."""
        return obj.val

    def to_representation(self, instance):
        """To representation of indicator value."""
        data = super(IndicatorValueSerializer, self).to_representation(
            instance)
        data.update({
            'reference_layer': '-',
            'reference_layer_name': '-',
            'name': '-',
            'admin_level': '-',
        })
        try:
            entities = Entity.objects.filter(
                geom_id=instance.geom_id
            )
            if entities.count():
                data.update({
                    'reference_layer': [],
                    'reference_layer_name': [],
                    'name': [],
                    'admin_level': [],
                })

            for entity in entities:
                if not entity.reference_layer:
                    continue
                data['reference_layer'].append(
                    entity.reference_layer.identifier
                )
                data['reference_layer_name'].append(
                    entity.reference_layer.name
                )
                data['name'].append(entity.reference_layer.name)
                data['admin_level'].append(entity.admin_level)
            data['admin_level'] = list(set(data['admin_level']))
        except Entity.DoesNotExist:
            pass
        return data

    class Meta:  # noqa: D106
        model = IndicatorValue
        exclude = ('value_str',)


class IndicatorValueWithPermissionSerializer(IndicatorValueSerializer):
    """Serializer for IndicatorValue."""

    permission = serializers.SerializerMethodField()

    def get_permission(self, obj: IndicatorValue):
        """Return indicator name."""
        return obj.permissions(self.context.get('user', None))

    class Meta:  # noqa: D106
        model = IndicatorValue
        exclude = ('value_str',)


class IndicatorValueDetailSerializer(IndicatorValueSerializer):
    """Serializer for IndicatorValue."""

    details = serializers.SerializerMethodField()
    extra_data = serializers.SerializerMethodField()

    def get_details(self, obj: IndicatorValue):
        """Return extra data."""
        # for details
        details = []
        for row in obj.indicatorvalueextradetailrow_set.all():
            columns = {}
            for column in row.indicatorvalueextradetailcolumn_set.all():
                columns[column.name] = column.value
            details.append(columns)
        return details

    def get_extra_data(self, obj: IndicatorValue):
        """Return extra data."""
        # for details
        extras = {}
        for row in obj.indicatorextravalue_set.all():
            extras[row.name] = row.value
        return extras

    class Meta:  # noqa: D106
        model = IndicatorValue
        fields = '__all__'


class IndicatorValueBasicSerializer(serializers.ModelSerializer):
    """Serializer for IndicatorValue."""

    class Meta:  # noqa: D106
        model = IndicatorValue
        exclude = ('indicator', 'geom_id')
