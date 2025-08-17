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
import os

from django.shortcuts import reverse
from rest_framework import serializers

from core.models.preferences import SitePreferences
from geosight.data.models.dashboard import Dashboard, DashboardIndicator
from geosight.data.serializer.basemap_layer import BasemapLayerSerializer
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
from geosight.data.serializer.resource import ResourceSerializer
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

    # View
    view_url = serializers.SerializerMethodField()

    def get_description(self, obj: Dashboard):
        """
        Return the dashboard's description.

        :param obj: The dashboard instance.
        :type obj: Dashboard
        :return: The dashboard description, or an empty string if not set.
        :rtype: str
        """
        return obj.description if obj.description else ''

    def get_category(self, obj: Dashboard):
        """
        Return the dashboard's category name.

        Currently returns the group name if available.

        :param obj: The dashboard instance.
        :type obj: Dashboard
        :return: The category name.
        :rtype: str
        """
        return obj.group.name if obj.group else ''

    def get_group(self, obj: Dashboard):
        """
        Return the dashboard's group name.

        :param obj: The dashboard instance.
        :type obj: Dashboard
        :return: The group name, or empty string if no group is assigned.
        :rtype: str
        """
        return obj.group.name if obj.group else ''

    def get_widgets(self, obj: Dashboard):
        """
        Return serialized widgets for the dashboard.

        :param obj: The dashboard instance.
        :type obj: Dashboard
        :return: A list of serialized widgets.
        :rtype: list[dict]
        """
        if obj.id:
            return DashboardWidgetSerializer(
                obj.dashboardwidget_set.all(), many=True
            ).data
        else:
            return []

    def get_extent(self, obj: Dashboard):
        """
        Return the extent (bounding box) for the dashboard.

        :param obj: The dashboard instance.
        :type obj: Dashboard
        :return: A list representing the extent [xmin, ymin, xmax, ymax].
        :rtype: list[float]
        """
        return obj.extent.extent if obj.extent else [-100, -60, 100, 60]

    def get_reference_layer(self, obj: Dashboard):
        """
        Return the reference layer information for the dashboard.

        :param obj: The dashboard instance.
        :type obj: Dashboard
        :return:
            A dictionary with reference layer info
            (identifier, URL, name, is_local).
        :rtype: dict
        """
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
        """
        Return serialized indicator data.

        :param obj: The dashboard instance.
        :type obj: Dashboard
        :param model: A related DashboardIndicator instance.
        :type model: DashboardIndicator
        :return: Serialized indicator data.
        :rtype: dict
        """
        data = IndicatorSerializer(
            model.object,
            context={'user': self.context.get('user', None)},
            exclude=['last_update', 'permission']
        ).data
        return data

    def get_indicators(self, obj: Dashboard):
        """
        Return serialized indicators for the dashboard.

        Includes both database-linked and manually provided indicators
        from the serializer context.

        :param obj: The dashboard instance.
        :type obj: Dashboard
        :return: A list of serialized indicator data.
        :rtype: list[dict]
        """
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
        """
        Return serialized indicator layers for the dashboard.

        Allows for indicator layers to be provided via context override.

        :param obj: The dashboard instance.
        :type obj: Dashboard
        :return: A list of serialized indicator layer data.
        :rtype: list[dict]
        """
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
        """
        Return serialized basemap layers for the dashboard.

        Merges data from the basemap object and
        its dashboard-specific configuration.

        :param obj: The dashboard instance.
        :type obj: Dashboard
        :return: A list of serialized basemap layer data.
        :rtype: list[dict]
        """
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
        """
        Return serialized context layers for the dashboard.

        Combines data from the original layer and dashboard-specific overrides.
        Merges configuration fields and removes duplicated fields if needed.

        :param obj: The dashboard instance.
        :type obj: Dashboard
        :return:
            A list of serialized context layers with merged configurations.
        :rtype: list[dict]
        """
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
        """
        Return a list of related tables for the given dashboard.

        This method combines serialized data from the related table object
        and the dashboard-specific relation, then adds a URL to access
        the related table's geo data.

        :param obj: The dashboard instance.
        :type obj: Dashboard
        :return: A list of dictionaries representing the related tables.
        :rtype: list[dict]
        """
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
                'related_tables_geo_data-list',
                args=[model.object.id]
            )
            output.append(data)

        return output

    def get_filters(self, obj: Dashboard):
        """
        Return the list of filters configured for the dashboard.

        If no filters are defined, returns an empty list.

        :param obj: The dashboard instance.
        :type obj: Dashboard
        :return: A list of filters, parsed from JSON.
        :rtype: list
        """
        if obj.filters:
            return json.loads(obj.filters)
        else:
            return []

    def get_user_permission(self, obj: Dashboard):
        """
        Return the user's permissions for the given dashboard.

        If the dashboard does not have associated permissions,
        a default `DashboardPermission` instance is used.

        :param obj: The dashboard instance.
        :type obj: Dashboard
        :return:
            A dictionary or object representing the user's permission levels.
        :rtype: Any
        """
        try:
            return obj.permission.all_permission(
                self.context.get('user', None)
            )
        except DashboardPermission.DoesNotExist:
            return DashboardPermission().all_permission(
                self.context.get('user', None)
            )

    def get_geo_field(self, obj: Dashboard):
        """
        Return the geospatial field used for geometry matching on the map.

        :param obj: The dashboard instance.
        :type obj: Dashboard
        :return: The name of the geometry field used in spatial operations.
        :rtype: str
        """
        return obj.geo_field

    def get_level_config(self, obj: Dashboard):
        """
        Return the dashboard's level configuration.

        If no level configuration is set, an empty dictionary is returned.

        :param obj: The dashboard instance.
        :type obj: Dashboard
        :return: The level configuration dictionary.
        :rtype: dict
        """
        return obj.level_config if obj.level_config else {}

    def get_default_time_mode(self, obj: Dashboard):
        """
        Return the default time mode configuration for the given dashboard.

        If the dashboard has a custom `default_time_mode`, it will be returned.
        Otherwise, fallback to site-wide preferences.

        :param obj: The dashboard object to retrieve the time mode for.
        :type obj: Dashboard
        :return: A dictionary representing the default time mode configuration.
        :rtype: dict
        """
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
        """
        Return serialized tools associated with the dashboard.

        This method retrieves all related tools for the given dashboard
        and serializes them using `DashboardToolSerializer`.

        :param obj: The dashboard instance.
        :type obj: Dashboard
        :return: A list of serialized dashboard tools.
        :rtype: list[dict]
        """
        return DashboardToolSerializer(
            obj.dashboardtool_set.all(), many=True
        ).data

    def get_view_url(self, obj: Dashboard):
        """
        Return the URL to view the dashboard detail page.

        Uses Django's `reverse()` to resolve the URL based
        on the dashboard's slug.

        :param obj: The dashboard instance.
        :type obj: Dashboard
        :return:
            The URL to the dashboard detail view,
            or None if the slug is missing.
        :rtype: str or None
        """
        if not obj.slug:
            return None
        return reverse('dashboard-detail-view', args=[obj.slug])

    class Meta:  # noqa: D106
        model = Dashboard
        fields = (
            'id', 'slug', 'icon', 'name', 'description',
            'category', 'group', 'extent',
            'reference_layer', 'level_config',
            'indicators', 'indicator_layers', 'indicator_layers_structure',
            'context_layers', 'context_layers_structure',
            'basemaps_layers', 'basemaps_layers_structure',
            'widgets', 'widgets_structure',
            'related_tables',
            'user_permission',
            'geo_field',
            'overview', 'default_time_mode', 'tools',
            'view_url',

            # ------------------------------
            # Filters
            # ------------------------------
            'filters', 'filters_being_hidden', 'filters_allow_modify',

            # ------------------------------
            # Configuration for dashboard
            # ------------------------------
            'show_splash_first_open',
            'truncate_indicator_layer_name',
            'layer_tabs_visibility', 'transparency_config'
        )


class DashboardBasicSerializer(ResourceSerializer):
    """Serializer for Dashboard."""

    id = serializers.SerializerMethodField()
    group = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()
    permission = serializers.SerializerMethodField()
    thumbnail = serializers.SerializerMethodField()

    def get_id(self, obj: Dashboard):
        """
        Return the dashboard identifier.

        :param obj: The dashboard instance.
        :type obj: Dashboard
        :return: The slug of the dashboard, used as a unique identifier.
        :rtype: str
        """
        return obj.slug

    def get_group(self, obj: Dashboard):
        """
        Return the name of the dashboard's group.

        :param obj: The dashboard instance.
        :type obj: Dashboard
        :return:
            The name of the associated group,
            or an empty string if none exists.
        :rtype: str
        """
        return obj.group.name if obj.group else ''

    def get_category(self, obj: Dashboard):
        """
        Return the name of the dashboard's category.

        Note: This currently returns the group name,
        assuming group and category are the same.

        :param obj: The dashboard instance.
        :type obj: Dashboard
        :return:
            The name of the associated category,
            or an empty string if none exists.
        :rtype: str
        """
        return obj.group.name if obj.group else ''

    def get_permission(self, obj: Dashboard):
        """
        Return the user's permission set for the dashboard.

        :param obj: The dashboard instance.
        :type obj: Dashboard
        :return:
            A dictionary or object representing
            the user's permissions for this dashboard.
        :rtype: Any
        """
        return obj.permission.all_permission(
            self.context.get('user', None)
        )

    def get_thumbnail(self, obj: Dashboard):
        """
        Return the thumbnail URL or image data for the given dashboard.

        This method retrieves the thumbnail
        representation associated with the dashboard object.

        :param obj: The dashboard instance for which to retrieve the thumbnail.
        :type obj: Dashboard
        :return: The thumbnail, typically a URL or base64-encoded image.
        :rtype: str or None
        """
        from django.conf import settings
        if obj.thumbnail:
            if os.path.exists(obj.thumbnail):
                return obj.thumbnail.replace(
                    settings.MEDIA_ROOT, settings.MEDIA_URL).replace('//', '/')
        return None

    class Meta:  # noqa: D106
        model = Dashboard
        fields = (
                     'id', 'slug', 'icon', 'thumbnail', 'name',
                     'description', 'group', 'category', 'permission',
                     'reference_layer', 'creator'
                 ) + ResourceSerializer.Meta.fields
