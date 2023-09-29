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
    def attributes_definition(**kwargs) -> List[ImporterAttribute]:
        """Return attributes of the importer."""
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
            )
        ]

    def check_attributes(self):
        """Check attributes definition."""
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

    def _check_data_to_log(self, data: dict, note: dict) -> (dict, dict):
        """Save data that constructed from importer.

        :type data: dict
        :param data: Data that will be saved

        :type note: dict
        :param note: Note for each data

        :rtype (data, note): (dict, dict)
        """
        raise NotImplemented()

    def _save_log_data_to_model(self, data: dict):
        """Save data from log to actual model."""
        pass
