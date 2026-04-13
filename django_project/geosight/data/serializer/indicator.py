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

from geosight.data.forms.style import DYNAMIC_CLASSIFICATION_CHOICES
from geosight.data.models.indicator import (
    Indicator, IndicatorRule
)
from geosight.data.models.indicator.indicator_type import (
    IndicatorType, IndicatorAggregationsType
)
from geosight.data.models.style.base import StyleType
from geosight.data.models.style.indicator_style import IndicatorStyleType
from geosight.data.serializer.indicator_value import *  # noqa: F403
from geosight.data.serializer.resource import ResourceSerializer

TYPES = [IndicatorType.FLOAT, IndicatorType.INTEGER, IndicatorType.STRING]

INDICATOR_TYPES = [
    IndicatorAggregationsType.COUNT, IndicatorAggregationsType.SUM,
    IndicatorAggregationsType.MIN,
    IndicatorAggregationsType.MAX, IndicatorAggregationsType.AVG,
    IndicatorAggregationsType.MAJORITY, IndicatorAggregationsType.MINORITY
]

STYLE_TYPES = [
    StyleType.DYNAMIC_QUALITATIVE,
    StyleType.DYNAMIC_QUANTITATIVE,
    StyleType.PREDEFINED,
    IndicatorStyleType.LIBRARY
]

STYLE_CONFIG_DESCRIPTION = (
    'JSON object containing style configuration for dynamic style types. '
    'When style_type is DYNAMIC_QUALITATIVE or DYNAMIC_QUANTITATIVE, '
    'the following keys are expected: '
    'color_palette (int), color_palette_reverse (bool), '
    'dynamic_class_num (int), sync_outline (bool), sync_filter (bool), '
    'outline_color (str), outline_size (float), '
    f'dynamic_classification — one of {DYNAMIC_CLASSIFICATION_CHOICES}, '
    'and no_data_rule (object with name, rule, color, outline_color, '
    'outline_size, active).'
)


class IndicatorSerializer(DynamicModelSerializer):
    """Serializer for the Indicator model."""

    url = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()
    permission = serializers.SerializerMethodField()
    style = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    style_type = serializers.SerializerMethodField()
    style_config = serializers.SerializerMethodField()

    def get_url(self, obj: Indicator):
        """Return the absolute URL to the indicator's data-values endpoint.

        :param obj: The indicator instance being serialized.
        :type obj: Indicator
        :return: Absolute URL for the indicator data-values view.
        :rtype: str
        """
        return reverse(
            'indicator_data-values',
            args=[obj.id]
        )

    def get_category(self, obj: Indicator):
        """Return the name of the indicator's group (category).

        :param obj: The indicator instance being serialized.
        :type obj: Indicator
        :return: Group name, or an empty string if no group is assigned.
        :rtype: str
        """
        return obj.group.name if obj.group else ''

    def get_permission(self, obj: Indicator):
        """Return the permission map for the requesting user.

        :param obj: The indicator instance being serialized.
        :type obj: Indicator
        :return: Dictionary of permission flags for the current user.
        :rtype: dict
        """
        return obj.permission.all_permission(
            self.context.get('user', None)
        )

    def get_style_id(self, obj: Indicator):
        """Return the primary key of the indicator's linked style, if any.

        :param obj: The indicator instance being serialized.
        :type obj: Indicator
        :return: Style primary key, or ``None`` if no style is linked.
        :rtype: int or None
        """
        if obj.style:
            return obj.style.id
        else:
            return None

    def get_style(self, obj: Indicator):
        """Return the resolved style object for the requesting user.

        :param obj: The indicator instance being serialized.
        :type obj: Indicator
        :return: Style data resolved for the current user context.
        :rtype: dict or None
        """
        return obj.style_obj(self.context.get('user', None))

    def get_style_type(self, obj: Indicator):
        """Return the style type from the indicator's style configuration.

        :param obj: The indicator instance being serialized.
        :type obj: Indicator
        :return: Style type identifier.
        :rtype: str
        """
        return obj.style_conf.style_type

    def get_style_config(self, obj: Indicator):
        """Return the style configuration from the indicator's style config.

        :param obj: The indicator instance being serialized.
        :type obj: Indicator
        :return: Style configuration data.
        :rtype: dict or None
        """
        return obj.style_conf.style_config

    def get_full_name(self, obj: Indicator):
        """Return the string representation of the indicator.

        :param obj: The indicator instance being serialized.
        :type obj: Indicator
        :return: Full display name of the indicator.
        :rtype: str
        """
        return obj.__str__()

    class Meta:  # noqa: D106
        model = Indicator
        fields = (
            'id', 'name', 'category', 'shortcode', 'source', 'description',
            'url', 'full_name',
            'last_update', 'permission', 'type',
            'style_id', 'style', 'style_config', 'style_type', 'unit',
            'label_config'
        )
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
                'source': openapi.Schema(
                    title='Source',
                    type=openapi.TYPE_STRING
                ),
                'shortcode': openapi.Schema(
                    title='Shortcode',
                    type=openapi.TYPE_STRING
                ),
                'category': openapi.Schema(
                    title='Category',
                    type=openapi.TYPE_STRING
                ),
                'unit': openapi.Schema(
                    title='Unit',
                    type=openapi.TYPE_STRING
                ),
                'type': openapi.Schema(
                    title='Type',
                    type=openapi.TYPE_STRING,
                    description=(
                        f'The choices are {TYPES}'
                    )
                ),
                'min_value': openapi.Schema(
                    title='Min value',
                    type=openapi.TYPE_INTEGER
                ),
                'max_value': openapi.Schema(
                    title='Max value',
                    type=openapi.TYPE_INTEGER
                ),
                'aggregation_upper_level_allowed': openapi.Schema(
                    title='Allow aggregation upper level',
                    type=openapi.TYPE_BOOLEAN
                ),
                'aggregation_upper_level': openapi.Schema(
                    title='Aggregation upper level',
                    type=openapi.TYPE_STRING,
                    description=(
                        f'The choices are {INDICATOR_TYPES}'
                    )
                ),
                'aggregation_multiple_values': openapi.Schema(
                    title='Aggregation multiple values',
                    type=openapi.TYPE_STRING,
                    description=(
                        f'The choices are {INDICATOR_TYPES}'
                    )
                ),
                'style_type': openapi.Schema(
                    title='Aggregation multiple values',
                    type=openapi.TYPE_STRING,
                    description=(
                        f'The choices are {STYLE_TYPES}'
                    )
                ),
                'style_config': openapi.Schema(
                    title='Styles',
                    type=openapi.TYPE_OBJECT,
                    description=STYLE_CONFIG_DESCRIPTION
                ),
            },
            example={
                "name": "Indicator",
                "description": "",
                "source": "",
                "shortcode": "INDICATOR",
                "category": "Test",
                "unit": "Unit",
                "type": "Integer",
                "min_value": 0,
                "max_value": 100,
                "aggregation_upper_level_allowed": True,
                "aggregation_upper_level": "SUM(value)",
                "aggregation_multiple_values": "SUM(value)",
                "style_type": "Dynamic quantitative style.",
                "style_config": {
                    "no_data_rule": {
                        "name": "No data", "rule": "No data",
                        "color": "#D8D8D8", "active": "true",
                        "outline_size": "0.5",
                        "outline_color": "#ffffff"
                    },
                    "outline_size": 0.5, "sync_outline": False,
                    "color_palette": 3,
                    "outline_color": "#FFFFFF",
                    "dynamic_class_num": "7",
                    "color_palette_reverse": False,
                    "dynamic_classification": "Equidistant."
                }
            }
        )


class IndicatorAdminListSerializer(ResourceSerializer):
    """Serializer for the Indicator model used in admin list views.

    Extends :class:`ResourceSerializer` with computed ``url``,
    ``category``, and ``permission`` fields suitable for listing
    indicators with full audit and access metadata.
    """

    url = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()
    permission = serializers.SerializerMethodField()

    def get_url(self, obj: Indicator):
        """Return the absolute URL to the indicator's data-values endpoint.

        :param obj: The indicator instance being serialized.
        :type obj: Indicator
        :return: Absolute URL for the indicator data-values view.
        :rtype: str
        """
        return reverse(
            'indicator_data-values',
            args=[obj.id]
        )

    def get_category(self, obj: Indicator):
        """Return the name of the indicator's group (category).

        :param obj: The indicator instance being serialized.
        :type obj: Indicator
        :return: Group name, or an empty string if no group is assigned.
        :rtype: str
        """
        return obj.group.name if obj.group else ''

    def get_permission(self, obj: Indicator):
        """Return the permission map for the requesting user.

        :param obj: The indicator instance being serialized.
        :type obj: Indicator
        :return: Dictionary of permission flags for the current user.
        :rtype: dict
        """
        return obj.permission.all_permission(
            self.context.get('user', None)
        )

    class Meta:  # noqa: D106
        model = Indicator
        fields = (
                     'id', 'name', 'category', 'source', 'shortcode',
                     'description', 'url', 'permission', 'type',
                     'min_value', 'max_value',
                     'aggregation_upper_level_allowed',
                     'aggregation_upper_level', 'aggregation_multiple_values',
                     'style_type', 'style_config'
                 ) + ResourceSerializer.Meta.fields


class IndicatorBasicListSerializer(serializers.ModelSerializer):
    """Serializer for the Indicator model used in basic list views.

    Provides a minimal set of fields (``id``, ``name``, ``shortcode``,
    ``description``, ``category``) suitable for lightweight listing
    without audit or permission metadata.
    """

    category = serializers.SerializerMethodField()

    def get_category(self, obj: Indicator):
        """Return the name of the indicator's group (category).

        :param obj: The indicator instance being serialized.
        :type obj: Indicator
        :return: Group name, or an empty string if no group is assigned.
        :rtype: str
        """
        return obj.group.name if obj.group else ''

    class Meta:  # noqa: D106
        model = Indicator
        fields = (
            'id', 'name', 'shortcode', 'description', 'category')


class IndicatorRuleSerializer(serializers.ModelSerializer):
    """Serializer for IndicatorRule."""

    class Meta:  # noqa: D106
        model = IndicatorRule
        fields = '__all__'
