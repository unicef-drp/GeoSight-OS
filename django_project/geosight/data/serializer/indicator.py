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

from django.shortcuts import reverse

from core.serializer.dynamic_serializer import DynamicModelSerializer
from geosight.data.models.indicator import (
    Indicator, IndicatorRule
)
from geosight.data.serializer.indicator_value import *  # noqa: F403


class IndicatorSerializer(DynamicModelSerializer):
    """Serializer for Indicator."""

    url = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()
    permission = serializers.SerializerMethodField()
    style = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    style_type = serializers.SerializerMethodField()
    style_config = serializers.SerializerMethodField()

    def get_url(self, obj: Indicator):
        """Return url."""
        return reverse(
            'indicator-values-api',
            args=[obj.id]
        )

    def get_category(self, obj: Indicator):
        """Return group."""
        return obj.group.name if obj.group else ''

    def get_permission(self, obj: Indicator):
        """Return permission."""
        return obj.permission.all_permission(
            self.context.get('user', None)
        )

    def get_style_id(self, obj: Indicator):
        """Return style id if there."""
        if obj.style:
            return obj.style.id
        else:
            return None

    def get_style(self, obj: Indicator):
        """Return style."""
        return obj.style_obj(self.context.get('user', None))

    def get_style_type(self, obj: Indicator):
        """Return style."""
        return obj.style_conf.style_type

    def get_style_config(self, obj: Indicator):
        """Return style."""
        return obj.style_conf.style_config

    def get_full_name(self, obj: Indicator):
        """Return full_name."""
        return obj.__str__()

    class Meta:  # noqa: D106
        model = Indicator
        fields = (
            'id', 'name', 'category', 'shortcode', 'source', 'description',
            'url', 'full_name',
            'last_update', 'permission', 'type',
            'style_id', 'style', 'style_config', 'style_type'
        )


class IndicatorAdminListSerializer(serializers.ModelSerializer):
    """Serializer for Indicator."""

    url = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()
    permission = serializers.SerializerMethodField()

    def get_url(self, obj: Indicator):
        """Return url."""
        return reverse(
            'indicator-values-api',
            args=[obj.id]
        )

    def get_category(self, obj: Indicator):
        """Return group."""
        return obj.group.name if obj.group else ''

    def get_permission(self, obj: Indicator):
        """Return permission."""
        return obj.permission.all_permission(
            self.context.get('user', None)
        )

    class Meta:  # noqa: D106
        model = Indicator
        fields = (
            'id', 'name', 'category', 'source', 'shortcode',
            'description', 'url', 'permission', 'type'
        )


class IndicatorBasicListSerializer(serializers.ModelSerializer):
    """Serializer for basic Indicator."""

    category = serializers.SerializerMethodField()

    def get_category(self, obj: Indicator):
        """Return group."""
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


class IndicatorValueSerializer(serializers.ModelSerializer):
    """Serializer for IndicatorValue."""

    reference_layer = serializers.SerializerMethodField()
    reference_layer_name = serializers.SerializerMethodField()
    indicator_name = serializers.SerializerMethodField()
    indicator_shortcode = serializers.SerializerMethodField()
    value = serializers.SerializerMethodField()
    geom_id_type = serializers.SerializerMethodField()
    timestamp = serializers.SerializerMethodField()

    def get_reference_layer(self, obj: IndicatorValue):
        """Return reference layer."""
        if obj.reference_layer:
            return obj.reference_layer.identifier
        return '-'

    def get_reference_layer_name(self, obj: IndicatorValue):
        """Return reference layer name."""
        if obj.reference_layer:
            return obj.reference_layer.name
        return '-'

    def get_indicator_name(self, obj: IndicatorValue):
        """Return indicator name."""
        return obj.indicator.__str__()

    def get_indicator_shortcode(self, obj: IndicatorValue):
        """Return indicator id."""
        return obj.indicator.shortcode

    def get_geom_id_type(self, obj: IndicatorValue):
        """Return indicator id."""
        if obj.geom_id == obj.original_geom_id:
            return obj.original_geom_id_type
        return 'ucode'

    def get_value(self, obj: IndicatorValue):
        """Return value of indicator."""
        return obj.val

    def get_timestamp(self, obj: IndicatorValue):
        """Return timestamp of indicator."""
        date_time = datetime.combine(obj.date, datetime.min.time())
        return date_time.timestamp()

    class Meta:  # noqa: D106
        model = IndicatorValue
        fields = (
            'reference_layer', 'reference_layer_name', 'indicator_name',
            'indicator_shortcode', 'value', 'admin_level', 'geom_id',
            'geom_id_type', 'timestamp'
        )
