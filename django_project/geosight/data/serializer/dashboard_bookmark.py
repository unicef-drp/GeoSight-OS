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

from geosight.data.models.dashboard import DashboardBookmark


class DashboardBookmarkSerializer(serializers.ModelSerializer):
    """Serializer for dashboard bookmark."""

    filters = serializers.SerializerMethodField()
    creator = serializers.SerializerMethodField()
    extent = serializers.SerializerMethodField()

    def get_filters(self, obj: DashboardBookmark):
        """Return filters."""
        if obj.filters:
            return json.loads(obj.filters)
        else:
            return []

    def get_creator(self, obj: DashboardBookmark):
        """Return creator."""
        return obj.creator.username if obj.creator else ''

    def get_extent(self, obj: DashboardBookmark):
        """Return extent."""
        return obj.extent.extent if obj.extent else [0, 0, 0, 0]

    class Meta:  # noqa: D106
        model = DashboardBookmark
        fields = '__all__'
