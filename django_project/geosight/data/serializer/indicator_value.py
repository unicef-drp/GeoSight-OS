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

from core.serializer.dynamic_serializer import DynamicModelSerializer
from geosight.data.models.indicator import IndicatorValue


class IndicatorValueSerializer(DynamicModelSerializer):
    """Serializer for IndicatorValue."""

    geometry_code = serializers.SerializerMethodField()
    indicator = serializers.SerializerMethodField()
    indicator_id = serializers.SerializerMethodField()
    value = serializers.SerializerMethodField()
    attributes = serializers.SerializerMethodField()
    permission = serializers.SerializerMethodField()
    time = serializers.SerializerMethodField()

    def get_geometry_code(self, obj: IndicatorValue):
        """Return geometry_code."""
        return obj.geom_id

    def get_indicator(self, obj: IndicatorValue):
        """Return indicator name."""
        return obj.indicator.__str__()

    def get_indicator_id(self, obj: IndicatorValue):
        """Return indicator id."""
        return obj.indicator.id

    def get_value(self, obj: IndicatorValue):
        """Return value of indicator."""
        return obj.val

    def get_attributes(self, obj: IndicatorValue):
        """Return attributes value of indicator."""
        return obj.attributes

    def get_permission(self, obj: IndicatorValue):
        """Return indicator name."""
        return obj.permissions(self.context.get('user', None))

    def get_time(self, obj: IndicatorValue):
        """Return date."""
        return datetime.combine(
            obj.date, datetime.min.time(),
            tzinfo=pytz.timezone(settings.TIME_ZONE)
        ).timestamp()

    def get_entity_name(self, obj: IndicatorValue):
        """Return entity name."""
        return obj.entity_name

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
                'value': openapi.Schema(
                    title='Value',
                    type=openapi.TYPE_STRING
                ),
                'date': openapi.Schema(
                    title='Date',
                    type=openapi.TYPE_STRING
                ),
                'geom_id': openapi.Schema(
                    title='Geom id',
                    type=openapi.TYPE_STRING,
                ),
                'entity_name': openapi.Schema(
                    title='Admin unit name',
                    type=openapi.TYPE_STRING,
                    description='Name of the administrative unit'
                ),
                'admin_level': openapi.Schema(
                    title='Entity admin level',
                    type=openapi.TYPE_NUMBER
                ),
                'entity_name': openapi.Schema(
                    title='Entity name',
                    type=openapi.TYPE_STRING
                ),
                'country_id': openapi.Schema(
                    title='Country id',
                    type=openapi.TYPE_STRING
                ),
                'country_geom_id': openapi.Schema(
                    title='Country geom id',
                    type=openapi.TYPE_STRING
                ),
                'country_name': openapi.Schema(
                    title='Country name',
                    type=openapi.TYPE_STRING
                ),
                'attributes': openapi.Schema(
                    title='Attributes',
                    type=openapi.TYPE_OBJECT
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
                "indicator": "Test indicator",
                "indicator_id": 1,
                "indicator_shortcode": "TEST",
                "value": 0,
                "date": "1990-01-01",
                "geom_id": "GEOM_1",
                "admin_level": 1,
                "entity_name": "Geometry 1",
                "country_id": 1,
                "country_geom_id": "COUNTRY_1",
                "country_name": "Country 1",
                "attributes": {
                    'Value 1': 1
                },
                "permission": {
                    "list": True,
                    "read": True,
                    "edit": True,
                    "share": True,
                    "delete": True
                },
            }
        }
        post_body = openapi.Schema(
            description='Data that is needed for post new value.',
            type=openapi.TYPE_OBJECT,
            properties={
                'indicator_id': openapi.Schema(
                    title='Indicator id',
                    type=openapi.TYPE_NUMBER
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
                'country_geom_id': openapi.Schema(
                    title='Country geom id',
                    type=openapi.TYPE_STRING
                ),
                'attributes': openapi.Schema(
                    title='Attributes',
                    description=(
                        'Optional to save attributes. It is in json'
                    ),
                    type=openapi.TYPE_OBJECT,
                )
            }
        )
        delete_body = openapi.Schema(
            description='List of id of values.',
            type=openapi.TYPE_ARRAY,
            items=openapi.Items(
                type=openapi.TYPE_NUMBER
            )
        )


class IndicatorValueDetailSerializer(IndicatorValueSerializer):
    """Serializer for IndicatorValue."""

    details = serializers.SerializerMethodField()
    extra_data = serializers.SerializerMethodField()

    def get_details(self, obj: IndicatorValue):
        """Return extra data."""
        return obj.attributes

    def get_extra_data(self, obj: IndicatorValue):
        """Return extra data."""
        return obj.attributes

    class Meta:  # noqa: D106
        model = IndicatorValue
        fields = '__all__'
