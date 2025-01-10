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
__date__ = '09/01/2025'
__copyright__ = ('Copyright 2025, Unicef')

from rest_framework import serializers

from core.serializer.dynamic_serializer import DynamicModelSerializer


class ResourceSerializer(DynamicModelSerializer):
    """Resource serializer."""

    modified_at = serializers.SerializerMethodField()
    created_at = serializers.SerializerMethodField()
    created_by = serializers.SerializerMethodField()

    def get_modified_at(self, obj):
        """Return object last modified."""
        return obj.modified_at.strftime('%Y-%m-%d %H:%M:%S')

    def get_created_at(self, obj):
        """Return object created time."""
        return obj.modified_at.strftime('%Y-%m-%d %H:%M:%S')

    def get_created_by(self, obj):
        """Return object created by."""
        return obj.creator.username if obj.creator else ''

    class Meta:  # noqa: D106
        fields = (
            'created_at', 'modified_at', 'created_by'
        )
