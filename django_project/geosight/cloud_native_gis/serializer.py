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

from cloud_native_gis.serializer.layer import LayerSerializer
from rest_framework import serializers

from core.serializer.dynamic_serializer import DynamicModelSerializer
from geosight.cloud_native_gis.models import CloudNativeGISLayer


class CloudNativeGISLayerSerializer(
    LayerSerializer, DynamicModelSerializer
):
    """Serializer for CloudNativeGISLayer."""

    created_by = serializers.SerializerMethodField()
    permission = serializers.SerializerMethodField()

    def get_created_by(self, obj: CloudNativeGISLayer):
        """Return created by."""
        return obj.creator.username if obj.creator else ''

    def get_permission(self, obj: CloudNativeGISLayer):
        """Return permission."""
        return obj.permission.all_permission(
            self.context.get('user', None)
        )

    class Meta:  # noqa: D106
        model = CloudNativeGISLayer
        exclude = ()
