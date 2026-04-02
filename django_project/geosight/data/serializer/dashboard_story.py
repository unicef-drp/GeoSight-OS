# coding=utf-8
"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""
__author__ = 'ishaan.jain@emory.edu'
__date__ = '27/03/2026'
__copyright__ = ('Copyright 2026, Unicef')

from rest_framework import serializers

from geosight.data.models.dashboard.dashboard_story import DashboardStory


class DashboardStorySerializer(serializers.ModelSerializer):
    """Serializer for Dashboard Story."""

    bookmark_id = serializers.SerializerMethodField()

    def get_bookmark_id(self, obj: DashboardStory):
        """Return bookmark identifier."""
        return obj.bookmark.id if obj.bookmark else None

    class Meta:  # noqa: D106
        model = DashboardStory
        exclude = ('dashboard', 'bookmark')
