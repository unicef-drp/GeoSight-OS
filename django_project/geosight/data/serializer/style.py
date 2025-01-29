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

from rest_framework import serializers

from geosight.data.models.style import Style, StyleRule
from geosight.data.serializer.resource import ResourceSerializer


class StyleSerializer(ResourceSerializer):
    """Serializer for Style."""

    category = serializers.SerializerMethodField()
    styles = serializers.SerializerMethodField()
    permission = serializers.SerializerMethodField()

    def get_category(self, obj: Style):
        """Return group."""
        return obj.group

    def get_styles(self, obj: Style):
        """Return styles."""
        return StyleRuleSerializer(obj.stylerule_set.all(), many=True).data

    def get_permission(self, obj: Style):
        """Return permission."""
        return obj.permission.all_permission(
            self.context.get('user', None)
        )

    class Meta:  # noqa: D106
        model = Style
        exclude = ('group',)


class StyleRuleSerializer(serializers.ModelSerializer):
    """Serializer for StyleRule."""

    class Meta:  # noqa: D106
        model = StyleRule
        fields = '__all__'
