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

import ast
import json

from rest_framework import serializers

from geosight.data.models.dashboard import (
    DashboardIndicatorLayer, DashboardIndicatorLayerIndicator,
    DashboardIndicatorLayerRelatedTable, DashboardIndicatorLayerRule,
    DashboardIndicatorLayerField, default_chart_style
)
from geosight.data.models.style.indicator_style import IndicatorStyleType
from geosight.data.serializer.dashboard_relation import DashboardSerializer
from geosight.data.serializer.style import StyleSerializer


class DashboardIndicatorLayerSerializer(DashboardSerializer):
    """Serializer for DashboardLayer."""

    name = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()
    indicators = serializers.SerializerMethodField()
    related_tables = serializers.SerializerMethodField()
    last_update = serializers.SerializerMethodField()
    chart_style = serializers.SerializerMethodField()
    config = serializers.SerializerMethodField()

    style = serializers.SerializerMethodField()
    style_id = serializers.SerializerMethodField()
    style_type = serializers.SerializerMethodField()
    style_data = serializers.SerializerMethodField()

    label_config = serializers.SerializerMethodField()
    level_config = serializers.SerializerMethodField()
    data_fields = serializers.SerializerMethodField()

    def get_data_fields(self, obj: DashboardIndicatorLayer):
        """Return dashboard group name."""
        output = DashboardIndicatorLayerFieldSerializer(
            obj.dashboardindicatorlayerfield_set, many=True
        ).data
        if len(output):
            return output
        return None

    def get_name(self, obj: DashboardIndicatorLayer):
        """Return dashboard group name."""
        return obj.label

    def get_description(self, obj: DashboardIndicatorLayer):
        """Return dashboard group name."""
        return obj.desc

    def get_indicators(self, obj: DashboardIndicatorLayer):
        """Return rules."""
        return DashboardIndicatorLayerIndicatorSerializer(
            obj.dashboardindicatorlayerindicator_set.all(), many=True
        ).data

    def get_related_tables(self, obj: DashboardIndicatorLayer):
        """Return rules."""
        return DashboardIndicatorLayerRelatedTableSerializer(
            obj.dashboardindicatorlayerrelatedtable_set.all(), many=True
        ).data

    def get_last_update(self, obj: DashboardIndicatorLayer):
        """Return last update."""
        return obj.last_update

    def get_chart_style(self, obj: DashboardIndicatorLayer):
        """Return last update."""
        if not obj.chart_style:
            return None
        if isinstance(obj.chart_style, list):
            return default_chart_style
        elif isinstance(obj.chart_style, str):
            try:
                return json.loads(obj.chart_style)
            except ValueError:
                return default_chart_style
        else:
            return obj.chart_style

    def get_config(self, obj: DashboardIndicatorLayer):
        """Return last update."""
        output = {}
        for config in obj.dashboardindicatorlayerconfig_set.all():
            try:
                output[config.name] = ast.literal_eval(config.value)
            except Exception:
                output[config.name] = config.value
        return output

    def get_style(self, obj: DashboardIndicatorLayer):
        """Return style."""
        indicators = obj.dashboardindicatorlayerindicator_set.all()
        if indicators.count() >= 2:
            return DashboardIndicatorLayerIndicatorSerializer(
                obj.dashboardindicatorlayerindicator_set, many=True
            ).data
        else:
            if obj.is_using_obj_style:
                return obj.style_obj(self.context.get('user', None))
        return []

    def get_style_id(self, obj: DashboardIndicatorLayer):
        """Return rules."""
        if obj.is_using_obj_style:
            if obj.style_type == IndicatorStyleType.LIBRARY:
                if obj.style:
                    return obj.style.id
        return None

    def get_style_type(self, obj: DashboardIndicatorLayer):
        """Return rules."""
        if obj.is_using_obj_style:
            return obj.style_type
        return ''

    def get_style_data(self, obj: DashboardIndicatorLayer):
        """Return rules."""
        if obj.is_using_obj_style:
            if obj.style:
                data = StyleSerializer(
                    obj.style,
                    fields=[
                        'name', 'id', 'style_type', 'style_config', 'styles'
                    ]
                ).data
                data['style'] = data['styles']
                del data['styles']
                return data
            else:
                return None

    def get_label_config(self, obj: DashboardIndicatorLayer):
        """Return style."""
        if obj.is_using_obj_style:
            return obj.label_config
        return None

    def get_level_config(self, obj: DashboardIndicatorLayer):
        """Return level_config."""
        return obj.level_config if obj.level_config else {}

    class Meta:  # noqa: D106
        model = DashboardIndicatorLayer
        fields = (
            'id', 'name', 'description', 'type',
            'indicators', 'related_tables',
            'chart_style', 'config', 'last_update',
            'style', 'style_id', 'style_type', 'style_data', 'style_config',
            'label_config', 'level_config', 'data_fields',
            'popup_template', 'popup_type', 'multi_indicator_mode'
        )
        fields += DashboardSerializer.Meta.fields


class DashboardIndicatorLayerRuleSerializer(serializers.ModelSerializer):
    """Serializer for DashboardIndicatorLayerRule."""

    class Meta:  # noqa: D106
        model = DashboardIndicatorLayerRule
        exclude = ('object',)


class DashboardIndicatorLayerObjectSerializer(serializers.ModelSerializer):
    """Serializer for DashboardLayer."""

    id = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    rule = serializers.SerializerMethodField()
    active = serializers.SerializerMethodField()

    def get_id(self, obj: DashboardIndicatorLayerIndicator):
        """Return dashboard group name."""
        return obj.indicator.id

    def get_name(self, obj: DashboardIndicatorLayerIndicator):
        """Return dashboard group name."""
        return obj.name if obj.name else obj.indicator.name

    def get_rule(self, obj: DashboardIndicatorLayerIndicator):
        """Return rule."""
        return f'x=={obj.indicator.id}'

    def get_active(self, obj: DashboardIndicatorLayerIndicator):
        """Return the rule is active or not."""
        return True

    class Meta:  # noqa: D106
        model = DashboardIndicatorLayerIndicator
        fields = (
            'id', 'indicator', 'rule', 'order',
            'name', 'color', 'active', 'shortcode'
        )


class DashboardIndicatorLayerIndicatorSerializer(
    DashboardIndicatorLayerObjectSerializer
):
    """Serializer for dashboard indicator layer."""

    indicator = serializers.SerializerMethodField()
    shortcode = serializers.SerializerMethodField()

    style = serializers.SerializerMethodField()
    style_id = serializers.SerializerMethodField()
    style_type = serializers.SerializerMethodField()
    style_data = serializers.SerializerMethodField()

    def get_indicator(self, obj: DashboardIndicatorLayerIndicator):
        """Return dashboard group name."""
        return obj.indicator.__str__()

    def get_shortcode(self, obj: DashboardIndicatorLayerIndicator):
        """Return indicator shortcode."""
        return obj.indicator.shortcode

    def get_style(self, obj: DashboardIndicatorLayerIndicator):
        """Return style."""
        if obj.override_style:
            return None
        return obj.indicator.style_obj(self.context.get('user', None))

    def get_style_id(self, obj: DashboardIndicatorLayerIndicator):
        """Return rules."""
        if obj.override_style:
            return None
        if obj.style:
            return obj.style.id
        return None

    def get_style_type(self, obj: DashboardIndicatorLayerIndicator):
        """Return rules."""
        if obj.override_style:
            return None
        return obj.style_type

    def get_style_data(self, obj: DashboardIndicatorLayerIndicator):
        """Return rules."""
        if obj.override_style:
            return None
        if obj.style:
            data = StyleSerializer(
                obj.style,
                fields=[
                    'name', 'id', 'style_type', 'style_config', 'styles'
                ]
            ).data
            data['style'] = data['styles']
            del data['styles']
            return data
        else:
            return None

    class Meta:  # noqa: D106
        model = DashboardIndicatorLayerIndicator
        fields = (
            'id', 'indicator', 'rule', 'order',
            'name', 'color', 'active', 'shortcode',
            'style', 'style_id', 'style_type', 'style_data', 'style_config',
            'override_style'
        )


class DashboardIndicatorLayerRelatedTableSerializer(
    DashboardIndicatorLayerObjectSerializer
):
    """Serializer for dashboard indicator layer related table."""

    related_table = serializers.SerializerMethodField()

    def get_id(self, obj: DashboardIndicatorLayerRelatedTable):
        """Return dashboard group name."""
        return obj.related_table.id

    def get_name(self, obj: DashboardIndicatorLayerRelatedTable):
        """Return dashboard group name."""
        return obj.name

    def get_related_table(self, obj: DashboardIndicatorLayerRelatedTable):
        """Return dashboard group name."""
        return obj.related_table.__str__()

    def get_rule(self, obj: DashboardIndicatorLayerRelatedTable):
        """Return rule."""
        return f'x=={obj.related_table.id}'

    def get_active(self, obj: DashboardIndicatorLayerRelatedTable):
        """Return the rule is active or not."""
        return True

    class Meta:  # noqa: D106
        model = DashboardIndicatorLayerRelatedTable
        fields = (
            'id', 'related_table', 'rule', 'order',
            'name', 'color', 'active'
        )


class DashboardIndicatorLayerFieldSerializer(serializers.ModelSerializer):
    """Serializer for DashboardIndicatorLayerField."""

    class Meta:  # noqa: D106
        model = DashboardIndicatorLayerField
        fields = '__all__'
