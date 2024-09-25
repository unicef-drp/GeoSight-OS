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

import mimetypes

from django.shortcuts import reverse
from rest_framework import serializers

from core.serializer.dynamic_serializer import DynamicModelSerializer
from geosight.reference_dataset.models.reference_dataset_importer import (
    ReferenceDatasetImporter, ReferenceDatasetImporterLevel
)


class ReferenceDatasetImporterSerializer(DynamicModelSerializer):
    """Serializer for ReferenceDatasetImporterSerializer."""

    created_by = serializers.SerializerMethodField()
    reference_layer_name = serializers.SerializerMethodField()
    urls = serializers.SerializerMethodField()
    levels = serializers.SerializerMethodField()

    def get_created_by(self, obj: ReferenceDatasetImporter):
        """Return creator name."""
        if obj.creator:
            return obj.creator.get_full_name()
        else:
            return None

    def get_reference_layer_name(self, obj: ReferenceDatasetImporter):
        """Return reference_layer name."""
        if obj.reference_layer:
            return obj.reference_layer.full_name()
        else:
            return None

    def get_urls(self, obj: ReferenceDatasetImporter):
        """Return urls of importer."""
        detail_url = reverse(
            'admin-reference-dataset-import-data-detail-view',
            args=[obj.reference_layer.identifier, obj.id]
        )
        return {
            'detail': detail_url
        }

    def get_levels(self, obj: ReferenceDatasetImporter):
        """Return urls of importer."""
        return ReferenceDatasetImporterLevelSerializer(
            obj.referencedatasetimporterlevel_set.all(), many=True
        ).data

    class Meta:  # noqa: D106
        model = ReferenceDatasetImporter
        fields = '__all__'


class ReferenceDatasetImporterLevelSerializer(DynamicModelSerializer):
    """Serializer for ReferenceDatasetImporterSerializer."""

    id = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    percent = serializers.SerializerMethodField()
    type = serializers.SerializerMethodField()

    def get_id(self, obj: ReferenceDatasetImporterLevel):
        """Return id."""
        return obj.file_id

    def get_name(self, obj: ReferenceDatasetImporterLevel):
        """Return file."""
        return obj.file.name

    def get_percent(self, obj: ReferenceDatasetImporterLevel):
        """Return percent."""
        return 100

    def get_status(self, obj: ReferenceDatasetImporterLevel):
        """Return percent."""
        return 'done'

    def get_type(self, obj: ReferenceDatasetImporterLevel):
        """Return percent."""
        mime_type, encoding = mimetypes.guess_type(obj.file.path)
        return mime_type

    class Meta:  # noqa: D106
        model = ReferenceDatasetImporterLevel
        fields = '__all__'
