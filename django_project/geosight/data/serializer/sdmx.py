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
__date__ = '10/11/2025'
__copyright__ = ('Copyright 2025, Unicef')

from rest_framework import serializers

from geosight.data.models.sdmx import SDMXConfig


class SDMXConfigSerializer(serializers.ModelSerializer):
    """Serializer for SDMXConfig."""

    urls = serializers.SerializerMethodField(read_only=True)

    def get_urls(self, obj):
        """Return urls."""
        return obj.urls

    class Meta:  # noqa: D106
        model = SDMXConfig
        fields = (
            "id", "name", "description", "url", "urls",
            "agency_id", "dataflow_id", "dataflow_version_id",
        )
        read_only_fields = ("id", "urls")
