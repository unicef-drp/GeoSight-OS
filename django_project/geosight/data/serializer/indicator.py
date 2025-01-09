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

from core.serializer.dynamic_serializer import DynamicModelSerializer
from geosight.data.models.indicator import (
    Indicator, IndicatorRule
)
from geosight.data.serializer.indicator_value import *  # noqa: F403
from geosight.data.serializer.resource import ResourceSerializer


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
            'style_id', 'style', 'style_config', 'style_type', 'unit',
            'label_config'
        )


class IndicatorAdminListSerializer(ResourceSerializer):
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
                 ) + ResourceSerializer.Meta.fields


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
