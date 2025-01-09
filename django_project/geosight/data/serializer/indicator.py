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


class IndicatorAdminListSerializer(DynamicModelSerializer):
    """Serializer for Indicator."""

    url = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()
    permission = serializers.SerializerMethodField()
    modified_at = serializers.SerializerMethodField()
    created_at = serializers.SerializerMethodField()
    created_by = serializers.SerializerMethodField()

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

    def get_modified_at(self, obj: Indicator):
        """Return indicator last modified."""
        return obj.modified_at.strftime('%Y-%m-%d %H:%M:%S')

    def get_created_at(self, obj: Indicator):
        """Return indicator created time."""
        return obj.modified_at.strftime('%Y-%m-%d %H:%M:%S')

    def get_created_by(self, obj: Indicator):
        """Return indicator created by."""
        return obj.creator.username if obj.creator else ''

    class Meta:  # noqa: D106
        model = Indicator
        fields = (
            'id', 'name', 'category', 'source', 'shortcode',
            'description', 'url', 'permission', 'type',
            'modified_at', 'created_at', 'created_by'
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
