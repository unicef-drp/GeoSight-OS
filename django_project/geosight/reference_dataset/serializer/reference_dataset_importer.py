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
        """
        Return the full name of the user who created the importer.

        :param obj: The importer instance.
        :type obj: ReferenceDatasetImporter
        :return: The full name of the creator, or `None` if not available.
        :rtype: str | None
        """
        if obj.creator:
            return obj.creator.get_full_name()
        else:
            return None

    def get_reference_layer_name(self, obj: ReferenceDatasetImporter):
        """
        Return the full name of the reference layer.

        :param obj: The importer instance.
        :type obj: ReferenceDatasetImporter
        :return:
            The full name of the reference layer, or `None` if not available.
        :rtype: str | None
        """
        if obj.reference_layer:
            return obj.reference_layer.full_name()
        else:
            return None

    def get_urls(self, obj: ReferenceDatasetImporter):
        """
        Return related URLs of the importer.

        Constructs URLs (e.g., detail view) associated with the given importer
        instance using Django's `reverse` function.

        :param obj: The importer instance for which URLs are being generated.
        :type obj: ReferenceDatasetImporter
        :return:
            A dictionary containing named URLs related to the importer.
            Currently includes the 'detail' view.
        :rtype: dict[str, str]
        """
        detail_url = reverse(
            'admin-reference-dataset-import-data-detail-view',
            args=[obj.reference_layer.identifier, obj.id]
        )
        return {
            'detail': detail_url
        }

    def get_levels(self, obj: ReferenceDatasetImporter):
        """Return urls of importer.

        This method serializes all related `ReferenceDatasetImporterLevel`
        objects that have a non-null `level` field.

        :param obj: The importer instance for which to retrieve levels.
        :type obj: ReferenceDatasetImporter
        :return: A list of serialized importer level data.
        :rtype: list[dict]
        """
        return ReferenceDatasetImporterLevelSerializer(
            obj.referencedatasetimporterlevel_set.filter(
                level__isnull=False
            ), many=True
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

    def get_id(self, obj: ReferenceDatasetImporterLevel) -> str:
        """Return id.

        :param obj: An instance of `ReferenceDatasetImporterLevel`.
        :type obj: ReferenceDatasetImporterLevel
        :return: Return file id of importer.
        :rtype: str
        """
        return obj.file_id

    def get_name(self, obj: ReferenceDatasetImporterLevel) -> str:
        """Return file.

        :param obj: An instance of `ReferenceDatasetImporterLevel`.
        :type obj: ReferenceDatasetImporterLevel
        :return: Return file name of importer.
        :rtype: str
        """
        return obj.file.name

    def get_percent(self, obj: ReferenceDatasetImporterLevel) -> int:
        """Return percent.

        :return: Return percentage of progress, just return 100 as it is done.
        :rtype: int

        :param obj: An instance of `ReferenceDatasetImporterLevel`.
        :type obj: ReferenceDatasetImporterLevel
        :return:
            The guessed MIME type of the file
            (e.g., 'text/csv', 'application/zip').
            Returns `None` if the type cannot be guessed.
        :rtype: str
        """
        return 100

    def get_status(self, obj: ReferenceDatasetImporterLevel) -> str:
        """Return status.

        :return: Return just 'done' as it is done.
        :rtype: str

        :param obj: An instance of `ReferenceDatasetImporterLevel`.
        :type obj: ReferenceDatasetImporterLevel
        :return:
            The guessed MIME type of the file
            (e.g., 'text/csv', 'application/zip').
            Returns `None` if the type cannot be guessed.
        :rtype: str
        """
        return 'done'

    def get_type(self, obj: ReferenceDatasetImporterLevel) -> str:
        """
        Get the MIME type of the file.

        Uses the `mimetypes` module to guess the MIME type of the file
        based on its path.

        :param obj: An instance of `ReferenceDatasetImporterLevel`.
        :type obj: ReferenceDatasetImporterLevel
        :return:
            The guessed MIME type of the file
            (e.g., 'text/csv', 'application/zip').
            Returns `None` if the type cannot be guessed.
        :rtype: str
        """
        mime_type, encoding = mimetypes.guess_type(obj.file.path)
        return mime_type

    class Meta:  # noqa: D106
        model = ReferenceDatasetImporterLevel
        fields = '__all__'
