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

from datetime import datetime

import pytz
from django.conf import settings
from drf_yasg import openapi
from rest_framework import serializers

from geosight.data.models.indicator import (
    IndicatorValue, IndicatorValueWithGeo, IndicatorExtraValue
)
from geosight.georepo.models.entity import Entity


class IndicatorValueSerializer(serializers.ModelSerializer):
    """Serializer for IndicatorValue."""

    indicator = serializers.SerializerMethodField()
    indicator_id = serializers.SerializerMethodField()
    indicator_shortcode = serializers.SerializerMethodField()
    value = serializers.SerializerMethodField()

    def get_indicator(self, obj: IndicatorValue):
        """Return indicator name."""
        return obj.indicator.__str__()

    def get_indicator_id(self, obj: IndicatorValue):
        """Return indicator id."""
        return obj.indicator.id

    def get_indicator_shortcode(self, obj: IndicatorValue):
        """Return indicator shortcode."""
        return obj.indicator.shortcode

    def get_value(self, obj: IndicatorValue):
        """Return value of indicator."""
        return obj.val

    def to_representation(self, instance):
        """To representation of indicator value."""
        data = super(IndicatorValueSerializer, self).to_representation(
            instance)
        geometries = []
        try:
            entities = Entity.objects.filter(
                geom_id=instance.geom_id
            )

            for entity in entities:
                if not entity.reference_layer:
                    continue
                geometries.append({
                    'dataset_uuid': entity.reference_layer.identifier,
                    'dataset_name': entity.reference_layer.name,
                    'name': entity.name,
                    'admin_level': entity.admin_level,
                })
        except Entity.DoesNotExist:
            pass
        data['geometries'] = geometries
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
        swagger_schema_fields = {
            'type': openapi.TYPE_OBJECT,
            'title': 'IndicatorValue',
            'properties': {
                'id': openapi.Schema(
                    title='id',
                    type=openapi.TYPE_NUMBER
                ),
                'indicator': openapi.Schema(
                    title='Indicator',
                    type=openapi.TYPE_STRING
                ),
                'indicator_id': openapi.Schema(
                    title='Indicator id',
                    type=openapi.TYPE_NUMBER
                ),
                'indicator_shortcode': openapi.Schema(
                    title='Indicator shortcode',
                    type=openapi.TYPE_STRING
                ),
                'value': openapi.Schema(
                    title='Value',
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
                'date': openapi.Schema(
                    title='Date',
                    type=openapi.TYPE_STRING
                ),
                'geom_id': openapi.Schema(
                    title='Geom id',
                    type=openapi.TYPE_STRING,
                ),
                'geometries': openapi.Schema(
                    title='Geometries',
                    type=openapi.TYPE_ARRAY,
                    items=openapi.Items(
                        type=openapi.TYPE_OBJECT,
                        properties={
                            'dataset_uuid': openapi.Schema(
                                title='Dataset uuid',
                                type=openapi.TYPE_STRING
                            ),
                            'dataset_name': openapi.Schema(
                                title='Dataset name',
                                type=openapi.TYPE_STRING
                            ),
                            'name': openapi.Schema(
                                title='Name',
                                type=openapi.TYPE_STRING
                            ),
                            'admin_level': openapi.Schema(
                                title='Admin level',
                                type=openapi.TYPE_NUMBER
                            ),
                        }
                    )
                ),
            },
            'example': {
                "id": 1,
                "indicator": "Test indicator",
                "indicator_id": 1,
                "indicator_shortcode": "TEST",
                "value": 0,
                "permission": {
                    "list": True,
                    "read": True,
                    "edit": True,
                    "share": True,
                    "delete": True
                },
                "date": "1990-01-01",
                "geom_id": "GEOM_1",
                "geometries": [
                    {
                        "dataset_uuid": "21f21520-d6e4-4928-95cf-afac44289e7b",
                        "dataset_name": "World (All Versions)",
                        "name": "Geometry 1",
                        "admin_level": 0
                    },
                    {
                        "dataset_uuid": "408bd456-bf89-48d2-9e82-d2c9c683af8a",
                        "dataset_name": "World (Latest)",
                        "name": "Geometry 1",
                        "admin_level": 0
                    }
                ]
            },
            'post_body': openapi.Schema(
                description='Data that is needed for post new value.',
                type=openapi.TYPE_OBJECT,
                properties={
                    'indicator_id': openapi.Schema(
                        title='Indicator id',
                        type=openapi.TYPE_NUMBER
                    ),
                    'indicator_shortcode': openapi.Schema(
                        title='Indicator shortcode',
                        type=openapi.TYPE_STRING
                    ),
                    'value': openapi.Schema(
                        title='New value',
                        type=openapi.TYPE_STRING
                    ),
                    'date': openapi.Schema(
                        title='Date',
                        description='Date is in YYYY-MM-DD in UTC.',
                        type=openapi.TYPE_STRING
                    ),
                    'geom_id': openapi.Schema(
                        title='Geom id',
                        type=openapi.TYPE_STRING,
                    ),
                    'dataset_uuid': openapi.Schema(
                        title='Dataset uuid',
                        type=openapi.TYPE_STRING
                    ),
                    'admin_level': openapi.Schema(
                        title='Admin level',
                        type=openapi.TYPE_NUMBER
                    ),
                    'extra_value': openapi.Schema(
                        title='Extra values',
                        description=(
                            'Optional to save extra values. It is in json'
                        ),
                        type=openapi.TYPE_OBJECT,
                    ),
                }
            ),
            'put_body': openapi.Schema(
                description='List of id with new value.',
                type=openapi.TYPE_ARRAY,
                items=openapi.Items(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'id': openapi.Schema(
                            title='Id of value',
                            type=openapi.TYPE_NUMBER
                        ),
                        'value': openapi.Schema(
                            title='New value',
                            type=openapi.TYPE_STRING
                        )
                    }
                )
            ),
            'delete_body': openapi.Schema(
                description='List of id of values.',
                type=openapi.TYPE_ARRAY,
                items=openapi.Items(
                    type=openapi.TYPE_NUMBER
                )
            )
        }


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


class _BaseIndicatorValueWithGeoSerializer(serializers.ModelSerializer):
    """Serializer for IndicatorValueWithGeo."""

    geometry_code = serializers.SerializerMethodField()
    value = serializers.SerializerMethodField()

    def get_geometry_code(self, obj: IndicatorValueWithGeo):
        """Return geometry_code."""
        return obj.geom_id

    def get_value(self, obj: IndicatorValue):
        """Return value of indicator."""
        return obj.val

    def to_representation(self, obj: IndicatorValueWithGeo):
        """To representation of indicator value."""
        data = super(
            _BaseIndicatorValueWithGeoSerializer, self
        ).to_representation(obj)

        for extra in IndicatorExtraValue.objects.filter(
                indicator_value_id=obj.id
        ):
            data[extra.name] = extra.value
        data['geometry_code'] = obj.geom_id
        return data

    class Meta:  # noqa: D106
        model = IndicatorValueWithGeo
        fields = (
            'geometry_code', 'value', 'concept_uuid', 'admin_level',
        )


class IndicatorValueWithGeoSerializer(_BaseIndicatorValueWithGeoSerializer):
    """Serializer for IndicatorValueWithGeo."""

    time = serializers.SerializerMethodField()

    def get_time(self, obj: IndicatorValueWithGeo):
        """Return time."""
        return datetime.combine(
            obj.date, datetime.min.time(),
            tzinfo=pytz.timezone(settings.TIME_ZONE)
        ).timestamp()

    class Meta:  # noqa: D106
        model = IndicatorValueWithGeo
        fields = (
            'geometry_code', 'value', 'concept_uuid', 'admin_level', 'time'
        )


class IndicatorValueWithGeoDateSerializer(
    _BaseIndicatorValueWithGeoSerializer
):
    """Serializer for IndicatorValueWithGeo."""

    date = serializers.SerializerMethodField()
    time = serializers.SerializerMethodField()

    def get_date(self, obj: IndicatorValueWithGeo):
        """Return date."""
        return obj.date.strftime("%d-%m-%Y")

    def get_time(self, obj: IndicatorValueWithGeo):
        """Return date."""
        return datetime.combine(
            obj.date, datetime.min.time(),
            tzinfo=pytz.timezone(settings.TIME_ZONE)
        ).timestamp()

    class Meta:  # noqa: D106
        model = IndicatorValueWithGeo
        fields = (
            'geometry_code', 'value', 'concept_uuid',
            'admin_level', 'date', 'time'
        )
