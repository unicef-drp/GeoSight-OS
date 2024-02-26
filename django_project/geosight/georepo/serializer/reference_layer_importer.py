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
__date__ = '26/02/2024'
__copyright__ = ('Copyright 2023, Unicef')

from rest_framework import serializers

from core.serializer.dynamic_serializer import DynamicModelSerializer
from geosight.georepo.models.reference_layer_importer import (
    ReferenceLayerViewImporter
)


class ReferenceLayerViewImporterSerializer(DynamicModelSerializer):
    """Serializer for ReferenceLayerViewImporterSerializer."""

    created_by = serializers.SerializerMethodField()
    reference_layer_name = serializers.SerializerMethodField()

    def get_created_by(self, obj: ReferenceLayerViewImporter):
        """Return creator name."""
        if obj.creator:
            return obj.creator.get_full_name()
        else:
            return None

    def get_reference_layer_name(self, obj: ReferenceLayerViewImporter):
        """Return reference_layer name."""
        if obj.reference_layer:
            return obj.reference_layer.full_name()
        else:
            return None

    class Meta:  # noqa: D106
        model = ReferenceLayerViewImporter
        fields = '__all__'
