# coding=utf-8
"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""
__author__ = 'zakki@kartoza.com'
__date__ = '22/01/2025'
__copyright__ = ('Copyright 2025, Unicef')

from rest_framework import serializers


class GetRasterClassificationSerializer(serializers.Serializer):
    """Serializer for raster classification."""

    url = serializers.URLField()
    class_type = serializers.CharField()
    class_num = serializers.IntegerField()
    colors = serializers.ListField(required=False)
