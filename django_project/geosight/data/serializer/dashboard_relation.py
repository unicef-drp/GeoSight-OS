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

import json

from rest_framework import serializers

from core.serializer.dynamic_serializer import DynamicModelSerializer
from geosight.data.models.dashboard import (
    DashboardIndicator, DashboardBasemap, DashboardContextLayer,
    DashboardIndicatorRule, DashboardContextLayerField,
    DashboardRelatedTable, DashboardTool
)
from geosight.data.models.style.indicator_style import IndicatorStyleType
from geosight.data.serializer.style import StyleSerializer


class DashboardIndicatorSerializer(serializers.ModelSerializer):
    """Serializer for DashboardIndicator."""

    style = serializers.SerializerMethodField()
    style_id = serializers.SerializerMethodField()
    style_type = serializers.SerializerMethodField()
    style_data = serializers.SerializerMethodField()
    label_config = serializers.SerializerMethodField()

    def get_style(self, obj: DashboardIndicator):
        """Return the style object for the indicator.

        Returns the dashboard-level override style if set,
        otherwise falls back to the indicator's own style.

        :param obj: The DashboardIndicator instance.
        :type obj: DashboardIndicator
        :returns: Style object for the indicator.
        :rtype: dict
        """
        if obj.override_style:
            return obj.style_obj(self.context.get('user', None))
        else:
            return obj.object.style_obj(self.context.get('user', None))

    def get_label_config(self, obj: DashboardIndicator):
        """Return the label configuration for the indicator.

        Returns the dashboard-level override label config if set,
        otherwise falls back to the indicator's own label config.

        :param obj: The DashboardIndicator instance.
        :type obj: DashboardIndicator
        :returns: Label configuration dict.
        :rtype: dict
        """
        if obj.override_label:
            return obj.label_config
        else:
            return obj.object.label_config

    def get_style_id(self, obj: DashboardIndicator):
        """Return the style library ID for the indicator.

        Returns the style ID if the dashboard overrides the style
        and the style type is LIBRARY, otherwise returns None.

        :param obj: The DashboardIndicator instance.
        :type obj: DashboardIndicator
        :returns: Style ID or None.
        :rtype: int or None
        """
        if obj.override_style:
            if obj.style_type == IndicatorStyleType.LIBRARY:
                if obj.style:
                    return obj.style.id
        return None

    def get_style_type(self, obj: DashboardIndicator):
        """Return the style type for the indicator.

        Returns the dashboard-level override style type if set,
        otherwise falls back to the indicator's own style type.

        :param obj: The DashboardIndicator instance.
        :type obj: DashboardIndicator
        :returns: Style type value.
        :rtype: str
        """
        if obj.override_style:
            return obj.style_type
        else:
            return obj.object.style_type

    def get_style_data(self, obj: DashboardIndicator):
        """Return serialized style data for the indicator.

        Returns full style data if the dashboard overrides the style,
        otherwise returns basic style data from the indicator's own style.

        :param obj: The DashboardIndicator instance.
        :type obj: DashboardIndicator
        :returns: Serialized style data or None.
        :rtype: dict or None
        """
        if obj.override_style:
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
        else:
            if obj.object.style:
                return StyleSerializer(
                    obj.object.style, fields=['name', 'id']
                ).data
            else:
                return None

    class Meta:  # noqa: D106
        model = DashboardIndicator
        fields = (
            'order', 'visible_by_default',
            'override_style',
            'style', 'style_id', 'style_type', 'style_data', 'style_config',
            'override_label', 'label_config'
        )


class DashboardSerializer(DynamicModelSerializer):
    """Dashboard relation serializer."""

    class Meta:  # noqa: D106
        fields = (
            'order', 'visible_by_default'
        )


class DashboardIndicatorRuleSerializer(serializers.ModelSerializer):
    """Serializer for IndicatorRule."""

    indicator = serializers.SerializerMethodField()

    def get_indicator(self, obj: DashboardIndicatorRule):
        """Return the indicator ID for this rule.

        :param obj: The DashboardIndicatorRule instance.
        :type obj: DashboardIndicatorRule
        :returns: ID of the related indicator.
        :rtype: int
        """
        return obj.object.object.id

    class Meta:  # noqa: D106
        model = DashboardIndicatorRule
        exclude = ('object',)


class DashboardBasemapSerializer(DashboardSerializer):
    """Serializer for DashboardBasemap."""

    class Meta:  # noqa: D106
        model = DashboardBasemap
        fields = DashboardSerializer.Meta.fields


class DashboardContextLayerSerializer(DashboardSerializer):
    """Serializer for DashboardContextLayer."""

    context_layer_id = serializers.SerializerMethodField()
    data_fields = serializers.SerializerMethodField()
    styles = serializers.SerializerMethodField()
    label_styles = serializers.SerializerMethodField()
    default_styles = serializers.SerializerMethodField()

    def get_context_layer_id(self, obj: DashboardContextLayer):
        """Return the ID of the associated context layer.

        :param obj: The DashboardContextLayer instance.
        :type obj: DashboardContextLayer
        :returns: Context layer ID or None if not set.
        :rtype: int or None
        """
        if obj.object:
            return obj.object.id
        return None

    def get_data_fields(self, obj: DashboardContextLayer):
        """Return the overridden data fields for the context layer.

        Returns serialized field data if the dashboard overrides fields,
        otherwise returns None.

        :param obj: The DashboardContextLayer instance.
        :type obj: DashboardContextLayer
        :returns: Serialized field data or None.
        :rtype: list or None
        """
        if obj.override_field:
            return DashboardContextLayerFieldSerializer(
                obj.dashboardcontextlayerfield_set, many=True).data
        return None

    def get_styles(self, obj: DashboardContextLayer):
        """Return the overridden styles for the context layer.

        Returns parsed JSON styles if the dashboard overrides the style,
        otherwise returns None.

        :param obj: The DashboardContextLayer instance.
        :type obj: DashboardContextLayer
        :returns: Styles dict or None.
        :rtype: dict or None
        """
        if obj.override_style:
            return json.loads(obj.styles) if obj.styles else None
        return None

    def get_label_styles(self, obj: DashboardContextLayer):
        """Return the overridden label styles for the context layer.

        Returns parsed JSON label styles if the dashboard overrides the label,
        otherwise returns None.

        :param obj: The DashboardContextLayer instance.
        :type obj: DashboardContextLayer
        :returns: Label styles dict or None.
        :rtype: dict or None
        """
        if obj.override_label:
            return json.loads(obj.label_styles) if obj.label_styles else None
        return None

    def get_default_styles(self, obj: DashboardContextLayer):
        """Return the default styles from the original context layer.

        Fetches data fields, styles, and label styles directly from
        the context layer's own serialized data.

        :param obj: The DashboardContextLayer instance.
        :type obj: DashboardContextLayer
        :returns: Dict with data_fields, styles, and label_styles.
        :rtype: dict
        """
        from geosight.data.serializer.context_layer import (
            ContextLayerSerializer
        )
        context_layer = ContextLayerSerializer(obj.object).data
        return {
            'data_fields': context_layer['data_fields'],
            'styles': context_layer['styles'],
            'label_styles': context_layer['label_styles'],
        }

    class Meta:  # noqa: D106
        model = DashboardContextLayer
        fields = (
            'data_fields', 'styles', 'label_styles',
            'override_style', 'override_label', 'override_field',
            'default_styles', 'configuration', 'context_layer_id',
            'layer_name', 'layer_description'
        )
        fields += DashboardSerializer.Meta.fields


class DashboardRelatedTableSerializer(DashboardSerializer):
    """Serializer for DashboardRelatedTable."""

    selected_related_fields = serializers.SerializerMethodField()

    def get_selected_related_fields(self, obj: DashboardRelatedTable):
        """Return the selected related table fields.

        Falls back to the related table's own fields if no dashboard-level
        selection has been made.

        :param obj: The DashboardRelatedTable instance.
        :type obj: DashboardRelatedTable
        :returns: List of selected field names.
        :rtype: list
        """
        if not obj.selected_related_fields:
            return obj.object.related_fields
        return obj.selected_related_fields

    class Meta:  # noqa: D106
        model = DashboardRelatedTable
        fields = (
            'selected_related_fields', 'geography_code_type',
            'geography_code_field_name', 'query'
        )
        fields += DashboardSerializer.Meta.fields


class DashboardContextLayerFieldSerializer(serializers.ModelSerializer):
    """Serializer for ContextLayerField."""

    class Meta:  # noqa: D106
        model = DashboardContextLayerField
        fields = '__all__'


class DashboardToolSerializer(serializers.ModelSerializer):
    """Serializer for DashboardTool."""

    class Meta:  # noqa: D106
        model = DashboardTool
        exclude = ('id', 'group', 'order', 'relation_group', 'dashboard')
