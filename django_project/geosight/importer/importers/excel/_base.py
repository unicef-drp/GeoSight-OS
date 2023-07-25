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

from pyexcel_xls import get_data as xls_get
from pyexcel_xlsx import get_data as xlsx_get

from geosight.importer.attribute import ImporterAttribute
from geosight.importer.exception import ImporterError
from geosight.importer.utilities import clean_value


class BaseExcelFormatImporter(ABC):
    """Import data from excel format."""

    attributes = {}
    mapping = {}

    @staticmethod
    def attributes_definition(**kwargs) -> List[ImporterAttribute]:
        """Return attributes of the importer."""
        from geosight.importer.attribute import ImporterAttributeInputType
        return [
            ImporterAttribute(
                name='file',
                input_type=ImporterAttributeInputType.FILE
            ),
            ImporterAttribute(
                name='sheet_name',
                input_type=ImporterAttributeInputType.TEXT
            ),
            ImporterAttribute(
                name='row_number_for_header',
                input_type=ImporterAttributeInputType.NUMBER
            )
        ]

    def file_content(self):
        """Return file content of excel.

        It can be from file or stream
        """
        try:
            _file = self.attributes['file']
            if _file:
                _file.seek(0)
            else:
                raise KeyError
        except KeyError:
            raise ImporterError('File does not exist')

        return _file

    def get_records(self) -> List:
        """Get records form upload session.

        Returning records and headers
        """
        content = self.file_content()
        try:
            try:
                sheet = xlsx_get(content)
            except Exception:
                sheet = xls_get(content)
        except Exception:
            raise ImporterError('File is not excel.')

        records = []
        if sheet:
            try:
                records = sheet[self.attributes.get('sheet_name', '')]
            except KeyError:
                raise ImporterError(
                    f'Sheet name : {self.attributes.get("sheet_name", "")} '
                    f'does not exist.'
                )

        # format data
        try:
            column_header = int(self.attributes['row_number_for_header'])
        except ValueError:
            raise ImporterError('row_number_for_header is not an integer')

        records = records[column_header - 1:]
        headers = records[0]

        data = []
        for record in records[1:]:
            row = {}
            for idx, header in enumerate(headers):
                try:
                    row[header] = clean_value(record[idx])
                except (ValueError, IndexError):
                    pass
            for key, value in self.mapping.items():
                try:
                    row[value] = clean_value(row[key])
                except KeyError:
                    pass
            data.append(row)
        return data
