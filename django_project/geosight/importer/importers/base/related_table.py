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

import uuid
from abc import ABC
from typing import List

from geosight.data.models.related_table import RelatedTable
from geosight.importer.attribute import ImporterAttribute
from geosight.importer.exception import ImporterError
from ._base import BaseImporter


class AbstractImporterRelatedTable(BaseImporter, ABC):
    """Abstract class for importer of related table."""

    @staticmethod
    def attributes_definition(  # noqa: DOC103
            **kwargs
    ) -> List[ImporterAttribute]:
        """
        Define attribute schema required for the related table importer.

        These attributes specify metadata about the related table being
        imported, such as its name, UUID, source, and description.

        :param kwargs:
            Optional keyword arguments for flexibility in subclassing.
        :type kwargs: dict
        :return: List of attribute definitions used by the importer.
        :rtype: list[ImporterAttribute]
        """
        from geosight.importer.attribute import ImporterAttributeInputType
        return [
            ImporterAttribute(
                name='related_table_name',
                input_type=ImporterAttributeInputType.TEXT
            ),
            ImporterAttribute(
                name='related_table_uuid',
                input_type=ImporterAttributeInputType.TEXT,
                required=False
            ),
            ImporterAttribute(
                name='related_table_source',
                input_type=ImporterAttributeInputType.TEXT,
                required=False
            ),
            ImporterAttribute(
                name='related_table_category',
                input_type=ImporterAttributeInputType.TEXT,
                required=False
            ),
            ImporterAttribute(
                name='related_table_description',
                input_type=ImporterAttributeInputType.TEXT,
                required=False
            )
        ]

    def check_attributes(self):
        """
        Validate the importer attributes and check related table permissions.

        If a ``related_table_uuid`` is provided, the importer verifies that
        the related table exists and that the current user has permission
        to edit it.

        If no UUID is provided,
        a new unique ID will be generated automatically.

        :raises ImporterError:
            If the related table does not exist,
            or if the user lacks permission
            to edit the data.
        """
        super().check_attributes()
        related_table_uuid = self.get_attribute('related_table_uuid')
        if related_table_uuid:
            try:
                related_table = RelatedTable.objects.get(
                    unique_id=related_table_uuid
                )
                if not related_table.permission.has_edit_data_perm(
                        self.importer.creator
                ):
                    raise ImporterError(
                        'Uploader does not have READ DATA permission.'
                    )
            except RelatedTable.DoesNotExist:
                raise ImporterError(
                    f'Related table with ID '
                    f'{related_table_uuid} does not exist.'
                )
        else:
            self.attributes['related_table_uuid'] = str(uuid.uuid4())

    def _check_data_to_log(  # noqa : DOC501, DOC503
            self, data: dict, note: dict
    ) -> (dict, dict):
        """Save data that constructed from importer.

        :type data: dict
        :param data: Data that will be saved

        :type note: dict
        :param note: Note for each data

        :return: Return data and note.
        :rtype (data, note): (dict, dict)
        """
        raise NotImplemented()

    def _save_log_data_to_model(self, data: dict):
        """
        Save validated data from the log into the actual Django model.

        This function should be implemented by concrete importer subclasses
        to perform database writes or updates based on validated importer data.

        :param data: The validated data ready to be persisted.
        :type data: dict
        """
        pass
