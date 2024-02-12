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
__date__ = '12/02/2024'
__copyright__ = ('Copyright 2023, Unicef')

from rest_framework import serializers

from geosight.georepo.models.reference_layer import ReferenceLayerView


class ReferenceLayerViewSerializer(serializers.ModelSerializer):
    """Serializer for ReferenceLayerView."""

    class Meta:  # noqa: D106
        model = ReferenceLayerView
        fields = ('id', 'name', 'identifier', 'description')
