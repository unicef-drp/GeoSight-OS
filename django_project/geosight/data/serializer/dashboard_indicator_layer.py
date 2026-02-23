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
        """
        Return serialized dashboard indicator layer fields.

        :param obj: Dashboard indicator layer instance.
        :type obj: DashboardIndicatorLayer
        :return: Serialized field data or None if empty.
        :rtype: list[dict] | None
        """
        output = DashboardIndicatorLayerFieldSerializer(
            obj.dashboardindicatorlayerfield_set, many=True
        ).data
        if len(output):
            return output
        return None

    def get_name(self, obj: DashboardIndicatorLayer):
        """
        Return the dashboard group name (label).

        :param obj: Dashboard indicator layer instance.
        :type obj: DashboardIndicatorLayer
        :return: Label of the dashboard indicator layer.
        :rtype: str
        """
        return obj.label

    def get_description(self, obj: DashboardIndicatorLayer):
        """
        Return the dashboard group description.

        :param obj: Dashboard indicator layer instance.
        :type obj: DashboardIndicatorLayer
        :return: Description text.
        :rtype: str
        """
        return obj.desc

    def get_indicators(self, obj: DashboardIndicatorLayer):
        """
        Return serialized indicators for the layer.

        If ``obj.indicators`` exists, constructs indicator objects manually.
        Otherwise, fetches from related set.

        :param obj: Dashboard indicator layer instance.
        :type obj: DashboardIndicatorLayer
        :return: Serialized indicators.
        :rtype: list[dict]
        """
        query = obj.dashboardindicatorlayerindicator_set.all()
        try:
            if obj.indicators:
                query = []
                for indicator in obj.indicators:
                    query.append(
                        DashboardIndicatorLayerIndicator(
                            object=obj, indicator=indicator
                        )
                    )
        except AttributeError:
            pass
        return DashboardIndicatorLayerIndicatorSerializer(
            query, many=True
        ).data

    def get_related_tables(self, obj: DashboardIndicatorLayer):
        """
        Return serialized related tables.

        :param obj: Dashboard indicator layer instance.
        :type obj: DashboardIndicatorLayer
        :return: Serialized related tables.
        :rtype: list[dict]
        """
        return DashboardIndicatorLayerRelatedTableSerializer(
            obj.dashboardindicatorlayerrelatedtable_set.all(), many=True
        ).data

    def get_last_update(self, obj: DashboardIndicatorLayer):
        """
        Return last update timestamp.

        :param obj: Dashboard indicator layer instance.
        :type obj: DashboardIndicatorLayer
        :return: Last update value.
        :rtype: datetime | None
        """
        return obj.last_update

    def get_chart_style(self, obj: DashboardIndicatorLayer):
        """
        Return chart style configuration.

        If style is a JSON string, it is parsed. If empty or invalid,
        default style is used.

        :param obj: Dashboard indicator layer instance.
        :type obj: DashboardIndicatorLayer
        :return: Chart style configuration.
        :rtype: dict | list | None
        """
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
        """
        Return configuration as dictionary.

        Attempts to parse each config value using ``ast.literal_eval``.
        Falls back to string if parsing fails.

        :param obj: Dashboard indicator layer instance.
        :type obj: DashboardIndicatorLayer
        :return: Config mapping.
        :rtype: dict
        """
        output = {}
        for config in obj.dashboardindicatorlayerconfig_set.all():
            try:
                output[config.name] = ast.literal_eval(config.value)
            except Exception:
                output[config.name] = config.value
        return output

    def get_style(self, obj: DashboardIndicatorLayer):
        """
        Return computed style for the layer.

        If multiple indicators exist, returns empty list.
        If using object style, calls ``obj.style_obj``.

        :param obj: Dashboard indicator layer instance.
        :type obj: DashboardIndicatorLayer
        :return: Style configuration.
        :rtype: list | dict | None
        """
        indicators = obj.dashboardindicatorlayerindicator_set.all()
        if indicators.count() >= 2:
            return []
        else:
            if obj.is_using_obj_style:
                return obj.style_obj(self.context.get('user', None))
        return []

    def get_style_id(self, obj: DashboardIndicatorLayer):
        """
        Return ID of the applied style if available.

        Only applicable if style type is ``LIBRARY``.

        :param obj: Dashboard indicator layer instance.
        :type obj: DashboardIndicatorLayer
        :return: Style ID or None.
        :rtype: int | None
        """
        if obj.is_using_obj_style:
            if obj.style_type == IndicatorStyleType.LIBRARY:
                if obj.style:
                    return obj.style.id
        return None

    def get_style_type(self, obj: DashboardIndicatorLayer):
        """
        Return type of the applied style.

        :param obj: Dashboard indicator layer instance.
        :type obj: DashboardIndicatorLayer
        :return: Style type string or empty string.
        :rtype: str
        """
        if obj.is_using_obj_style:
            return obj.style_type
        return ''

    def get_style_data(self, obj: DashboardIndicatorLayer):
        """
        Return serialized style data if style is set.

        Includes ``name``, ``id``, ``style_type``, ``style_config``,
        and ``style`` (flattened).

        :param obj: Dashboard indicator layer instance.
        :type obj: DashboardIndicatorLayer
        :return: Style data or None.
        :rtype: dict | None
        """
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
        """
        Return label configuration if enabled.

        :param obj: Dashboard indicator layer instance.
        :type obj: DashboardIndicatorLayer
        :return: Label configuration or None.
        :rtype: dict | None
        """
        if obj.is_using_obj_label:
            return obj.label_config
        return None

    def get_level_config(self, obj: DashboardIndicatorLayer):
        """
        Return level configuration dictionary.

        :param obj: Dashboard indicator layer instance.
        :type obj: DashboardIndicatorLayer
        :return: Level configuration.
        :rtype: dict
        """
        return obj.level_config if obj.level_config else {}

    class Meta:  # noqa: D106
        model = DashboardIndicatorLayer
        fields = (
            'id', 'name', 'description', 'type',
            'indicators', 'related_tables',
            'chart_style', 'config', 'last_update',
            'override_style',
            'style', 'style_id', 'style_type', 'style_data', 'style_config',
            'override_label',
            'label_config', 'level_config', 'data_fields',
            'popup_template', 'popup_type', 'multi_indicator_mode',
            'raw_data_popup_enable', 'raw_data_popup_config'
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
        """
        Return the related indicator ID.

        :param obj: Dashboard indicator layer indicator instance.
        :type obj: DashboardIndicatorLayerIndicator
        :return: Indicator ID.
        :rtype: int
        """
        return obj.indicator.id

    def get_name(self, obj: DashboardIndicatorLayerIndicator):
        """
        Return the indicator name.

        Falls back to ``obj.indicator.name`` if custom name is not set.

        :param obj: Dashboard indicator layer indicator instance.
        :type obj: DashboardIndicatorLayerIndicator
        :return: Indicator name.
        :rtype: str
        """
        return obj.name if obj.name else obj.indicator.name

    def get_rule(self, obj: DashboardIndicatorLayerIndicator):
        """
        Return a string rule for the indicator.

        :param obj: Dashboard indicator layer indicator instance.
        :type obj: DashboardIndicatorLayerIndicator
        :return: Rule expression string.
        :rtype: str
        """
        return f'x=={obj.indicator.id}'

    def get_active(self, obj: DashboardIndicatorLayerIndicator):
        """
        Return whether the rule is active.

        :param obj: Dashboard indicator layer indicator instance.
        :type obj: DashboardIndicatorLayerIndicator
        :return: Always ``True``.
        :rtype: bool
        """
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
    type = serializers.SerializerMethodField()

    style = serializers.SerializerMethodField()
    style_id = serializers.SerializerMethodField()
    style_type = serializers.SerializerMethodField()
    style_data = serializers.SerializerMethodField()

    def get_indicator(self, obj: DashboardIndicatorLayerIndicator):
        """
        Return the string representation of the indicator.

        :param obj: Dashboard indicator layer indicator instance.
        :type obj: DashboardIndicatorLayerIndicator
        :return: Indicator name as string.
        :rtype: str
        """
        return obj.indicator.__str__()

    def get_shortcode(self, obj: DashboardIndicatorLayerIndicator):
        """
        Return the indicator shortcode.

        :param obj: Dashboard indicator layer indicator instance.
        :type obj: DashboardIndicatorLayerIndicator
        :return: Indicator shortcode.
        :rtype: str
        """
        return obj.indicator.shortcode

    def get_type(self, obj: DashboardIndicatorLayerIndicator):
        """
        Return the indicator type.

        :param obj: Dashboard indicator layer indicator instance.
        :type obj: DashboardIndicatorLayerIndicator
        :return: Indicator type.
        :rtype: str
        """
        return obj.indicator.type

    def get_style(self, obj: DashboardIndicatorLayerIndicator):
        """
        Return style configuration if override is enabled.

        :param obj: Dashboard indicator layer indicator instance.
        :type obj: DashboardIndicatorLayerIndicator
        :return: Style configuration or None.
        :rtype: dict | None
        """
        if not obj.override_style:
            return None
        return obj.style_obj(self.context.get('user', None))

    def get_style_id(self, obj: DashboardIndicatorLayerIndicator):
        """
        Return style ID if override is enabled.

        :param obj: Dashboard indicator layer indicator instance.
        :type obj: DashboardIndicatorLayerIndicator
        :return: Style ID or None.
        :rtype: int | None
        """
        if not obj.override_style:
            return None
        if obj.style:
            return obj.style.id
        return None

    def get_style_type(self, obj: DashboardIndicatorLayerIndicator):
        """
        Return style type if override is enabled.

        :param obj: Dashboard indicator layer indicator instance.
        :type obj: DashboardIndicatorLayerIndicator
        :return: Style type or None.
        :rtype: str | None
        """
        if not obj.override_style:
            return None
        return obj.style_type

    def get_style_data(self, obj: DashboardIndicatorLayerIndicator):
        """
        Return serialized style data if override is enabled.

        Includes ``name``, ``id``, ``style_type``, ``style_config``,
        and ``style`` (flattened).

        :param obj: Dashboard indicator layer indicator instance.
        :type obj: DashboardIndicatorLayerIndicator
        :return: Style data or None.
        :rtype: dict | None
        """
        if not obj.override_style:
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
            'id', 'indicator', 'type', 'rule', 'order',
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
        """
        Return related table ID.

        :param obj: Dashboard indicator layer related table instance.
        :type obj: DashboardIndicatorLayerRelatedTable
        :return: Related table ID.
        :rtype: int
        """
        return obj.related_table.id

    def get_name(self, obj: DashboardIndicatorLayerRelatedTable):
        """
        Return related table name.

        :param obj: Dashboard indicator layer related table instance.
        :type obj: DashboardIndicatorLayerRelatedTable
        :return: Name of the related table.
        :rtype: str
        """
        return obj.name

    def get_related_table(self, obj: DashboardIndicatorLayerRelatedTable):
        """
        Return string representation of the related table.

        :param obj: Dashboard indicator layer related table instance.
        :type obj: DashboardIndicatorLayerRelatedTable
        :return: Related table name as string.
        :rtype: str
        """
        return obj.related_table.__str__()

    def get_rule(self, obj: DashboardIndicatorLayerRelatedTable):
        """
        Return rule string for the related table.

        :param obj: Dashboard indicator layer related table instance.
        :type obj: DashboardIndicatorLayerRelatedTable
        :return: Rule expression.
        :rtype: str
        """
        return f'x=={obj.related_table.id}'

    def get_active(self, obj: DashboardIndicatorLayerRelatedTable):
        """
        Return whether the rule is active.

        :param obj: Dashboard indicator layer related table instance.
        :type obj: DashboardIndicatorLayerRelatedTable
        :return: Always ``True``.
        :rtype: bool
        """
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
