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

from django.shortcuts import reverse
from rest_framework import serializers

from core.models.preferences import SitePreferences
from core.serializer.dynamic_serializer import DynamicModelSerializer
from geosight.data.models.dashboard import Dashboard, DashboardIndicator
from geosight.data.serializer.context_layer import ContextLayerSerializer
from geosight.data.serializer.dashboard_indicator_layer import (
    DashboardIndicatorLayerSerializer
)
from geosight.data.serializer.dashboard_relation import (
    DashboardBasemapSerializer,
    DashboardContextLayerSerializer, DashboardRelatedTableSerializer,
    DashboardToolSerializer
)
from geosight.data.serializer.dashboard_widget import DashboardWidgetSerializer
from geosight.data.serializer.indicator import IndicatorSerializer
from geosight.data.serializer.related_table import RelatedTableSerializer
from geosight.permission.models.resource.dashboard import DashboardPermission


class DashboardSerializer(serializers.ModelSerializer):
    """Serializer for Dashboard."""

    description = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()
    group = serializers.SerializerMethodField()
    widgets = serializers.SerializerMethodField()
    extent = serializers.SerializerMethodField()
    reference_layer = serializers.SerializerMethodField()

    indicators = serializers.SerializerMethodField()
    indicator_layers = serializers.SerializerMethodField()
    context_layers = serializers.SerializerMethodField()

    basemaps_layers = serializers.SerializerMethodField()
    related_tables = serializers.SerializerMethodField()
    filters = serializers.SerializerMethodField()
    user_permission = serializers.SerializerMethodField()
    geo_field = serializers.SerializerMethodField()
    level_config = serializers.SerializerMethodField()
    default_time_mode = serializers.SerializerMethodField()

    # Tools
    tools = serializers.SerializerMethodField()

    def get_description(self, obj: Dashboard):
        """Return description."""
        return obj.description if obj.description else ''

    def get_category(self, obj: Dashboard):
        """Return dashboard category name."""
        return obj.group.name if obj.group else ''

    def get_group(self, obj: Dashboard):
        """Return dashboard group name."""
        return obj.group.name if obj.group else ''

    def get_widgets(self, obj: Dashboard):
        """Return widgets."""
        if obj.id:
            return DashboardWidgetSerializer(
                obj.dashboardwidget_set.all(), many=True
            ).data
        else:
            return []

    def get_extent(self, obj: Dashboard):
        """Return extent."""
        return obj.extent.extent if obj.extent else [-100, -60, 100, 60]

    def get_reference_layer(self, obj: Dashboard):
        """Return reference_layer."""
        reference_layer = obj.reference_layer
        if reference_layer:
            return {
                'identifier': reference_layer.identifier,
                'detail_url': reference_layer.detail_url,
                'name': reference_layer.name,
                'is_local': reference_layer.is_local
            }
        else:
            return {
                'identifier': '',
                'detail_url': ''
            }

    def _get_indicator(self, obj: Dashboard, model: DashboardIndicator):
        """Return indicator data."""
        data = IndicatorSerializer(
            model.object,
            context={'user': self.context.get('user', None)},
            exclude=['last_update', 'permission']
        ).data
        return data

    def get_indicators(self, obj: Dashboard):
        """Return indicators."""
        output = []
        dashboard_indicators = self.context.get(
            'dashboard_indicators', None
        )
        for model in obj.dashboardindicator_set.all():
            output.append(self._get_indicator(obj, model))

        # Added data if the data added manually
        if dashboard_indicators:
            for model in dashboard_indicators:
                output.append(self._get_indicator(obj, model))

        return output

    def get_indicator_layers(self, obj: Dashboard):
        """Return indicator_layers."""
        dashboard_indicator_layers = self.context.get(
            'dashboard_indicator_layers', None
        )
        if not dashboard_indicator_layers:
            dashboard_indicator_layers = obj.dashboardindicatorlayer_set.all()

        return DashboardIndicatorLayerSerializer(
            dashboard_indicator_layers, many=True,
            context={'user': self.context.get('user', None)},
            exclude=['last_update']
        ).data

    def get_basemaps_layers(self, obj: Dashboard):
        """Return basemapsLayers."""
        output = []
        for model in obj.dashboardbasemap_set.all():
            data = BasemapLayerSerializer(
                model.object,
                context={'user': self.context.get('user', None)},
                exclude=['permission']
            ).data
            data.update(
                DashboardBasemapSerializer(
                    model, context={'user': self.context.get('user', None)}
                ).data
            )
            output.append(data)

        return output

    def get_context_layers(self, obj: Dashboard):
        """Return contextLayers."""
        output = []
        for model in obj.dashboardcontextlayer_set.all():
            data = ContextLayerSerializer(
                model.object,
                context={'user': self.context.get('user', None)},
                exclude=['permission']
            ).data
            dashboard_data = DashboardContextLayerSerializer(
                model,
                context={'user': self.context.get('user', None)}
            ).data
            if dashboard_data['data_fields']:
                del data['data_fields']
            else:
                del dashboard_data['data_fields']
            if dashboard_data['styles']:
                del data['styles']
            else:
                del dashboard_data['styles']
            if dashboard_data['label_styles']:
                del data['label_styles']
            else:
                del dashboard_data['label_styles']

            configuration = {}
            if data['configuration']:
                configuration = data['configuration']
            if dashboard_data['configuration']:
                configuration.update(dashboard_data['configuration'])

            data.update(dashboard_data)
            data['configuration'] = configuration
            output.append(data)
        return output

    def get_related_tables(self, obj: Dashboard):
        """Return related_tables."""
        output = []
        for model in obj.dashboardrelatedtable_set.all():
            data = RelatedTableSerializer(
                model.object,
                context={'user': self.context.get('user', None)},
                exclude=['rows', 'permission']
            ).data
            data.update(
                DashboardRelatedTableSerializer(
                    model, context={'user': self.context.get('user', None)}
                ).data
            )
            data['url'] = reverse(
                'related-table-values-api',
                args=[model.object.id]
            )
            output.append(data)

        return output

    def get_filters(self, obj: Dashboard):
        """Return filters."""
        if obj.filters:
            return json.loads(obj.filters)
        else:
            return []

    def get_user_permission(self, obj: Dashboard):
        """Return permissions of dashboard."""
        try:
            return obj.permission.all_permission(
                self.context.get('user', None)
            )
        except DashboardPermission.DoesNotExist:
            return DashboardPermission().all_permission(
                self.context.get('user', None)
            )

    def get_geo_field(self, obj: Dashboard):
        """Return geofield that will be used for geometry matching on map."""
        return obj.geo_field

    def get_level_config(self, obj: Dashboard):
        """Return level_config."""
        return obj.level_config if obj.level_config else {}

    def get_default_time_mode(self, obj: Dashboard):
        """Return default_time_mode."""
        if obj.default_time_mode:
            return obj.default_time_mode
        else:
            pref = SitePreferences.preferences()
            return {
                'use_only_last_known_value': True,
                'fit_to_current_indicator_range':
                    pref.fit_to_current_indicator_range,
                'show_last_known_value_in_range':
                    pref.show_last_known_value_in_range,
                'default_interval': pref.default_interval,
            }

    def get_tools(self, obj: Dashboard):
        """Return tools."""
        return DashboardToolSerializer(
            obj.dashboardtool_set.all(), many=True
        ).data

    class Meta:  # noqa: D106
        model = Dashboard
        fields = (
            'id', 'slug', 'icon', 'name', 'description',
            'category', 'group',
            'extent', 'filters', 'filters_allow_modify',
            'reference_layer', 'level_config',
            'indicators', 'indicator_layers', 'indicator_layers_structure',
            'context_layers', 'context_layers_structure',
            'basemaps_layers', 'basemaps_layers_structure',
            'widgets', 'widgets_structure',
            'related_tables',
            'user_permission',
            'geo_field', 'show_splash_first_open',
            'truncate_indicator_layer_name', 'enable_geometry_search',
            'overview', 'default_time_mode', 'tools'
        )


class DashboardBasicSerializer(DynamicModelSerializer):
    """Serializer for Dashboard."""

    id = serializers.SerializerMethodField()
    group = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()
    modified_at = serializers.SerializerMethodField()
    created_at = serializers.SerializerMethodField()
    created_by = serializers.SerializerMethodField()
    permission = serializers.SerializerMethodField()

    def get_id(self, obj: Dashboard):
        """Return dashboard id."""
        return obj.slug

    def get_group(self, obj: Dashboard):
        """Return dashboard group name."""
        return obj.group.name if obj.group else ''

    def get_category(self, obj: Dashboard):
        """Return dashboard category name."""
        return obj.group.name if obj.group else ''

    def get_modified_at(self, obj: Dashboard):
        """Return dashboard last modified."""
        return obj.modified_at.strftime('%Y-%m-%d %H:%M:%S')

    def get_created_at(self, obj: Dashboard):
        """Return dashboard created time."""
        return obj.modified_at.strftime('%Y-%m-%d %H:%M:%S')

    def get_created_by(self, obj: Dashboard):
        """Return dashboard created by."""
        return obj.creator.username if obj.creator else ''

    def get_permission(self, obj: Dashboard):
        """Return permission."""
        return obj.permission.all_permission(
            self.context.get('user', None)
        )

    class Meta:  # noqa: D106
        model = Dashboard
        fields = (
            'id', 'slug', 'icon', 'name', 'created_at', 'modified_at',
            'description', 'group', 'category', 'permission',
            'reference_layer', 'creator', 'created_by'
        )
