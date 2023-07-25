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

from abc import ABC
from typing import List

from geosight.data.models.sharepoint import SharepointConfig, SharepointError
from geosight.importer.attribute import ImporterAttribute
from geosight.importer.exception import ImporterError
from geosight.importer.importers.excel._base import BaseExcelFormatImporter


class BaseSharepointFormatImporter(BaseExcelFormatImporter, ABC):
    """Import data from excel format."""

    attributes = {}
    mapping = {}

    @staticmethod
    def attributes_definition(**kwargs) -> List[ImporterAttribute]:
        """Return attributes of the importer."""
        from geosight.importer.attribute import ImporterAttributeInputType
        return [
            ImporterAttribute(
                name='sheet_name',
                input_type=ImporterAttributeInputType.TEXT
            ),
            ImporterAttribute(
                name='row_number_for_header',
                input_type=ImporterAttributeInputType.NUMBER
            ),
            ImporterAttribute(
                name='sharepoint_config_id',
                input_type=ImporterAttributeInputType.NUMBER
            ),
            ImporterAttribute(
                name='sharepoint_relative_path',
                input_type=ImporterAttributeInputType.TEXT
            )
        ]

    def file_content(self):
        """Return file content of excel.

        It can be from file or stream
        """
        sharepoint_config_id = self.attributes['sharepoint_config_id']
        sharepoint_relative_path = self.attributes['sharepoint_relative_path']
        try:
            sharepoint = SharepointConfig.objects.get(id=sharepoint_config_id)
            return sharepoint.load_file(sharepoint_relative_path)
        except SharepointConfig.DoesNotExist:
            raise ImporterError(
                f'Sharepoint with id {sharepoint_config_id} does not exist'
            )
        except SharepointError as e:
            raise ImporterError(f'{e}')
