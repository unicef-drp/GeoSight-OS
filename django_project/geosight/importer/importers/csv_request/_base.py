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

import csv
from abc import ABC
from typing import List

import requests

from geosight.importer.attribute import ImporterAttribute
from geosight.importer.exception import ImporterError


class BaseCSVRequestFormatImporter(ABC):
    """Import data from excel format."""

    attributes = {}
    mapping = {}

    @staticmethod
    def attributes_definition(**kwargs) -> List[ImporterAttribute]:
        """Return attributes of the importer."""
        from geosight.importer.attribute import ImporterAttributeInputType
        return [
            ImporterAttribute(
                name='url',
                input_type=ImporterAttributeInputType.TEXT
            )
        ]

    def get_records(self) -> List:
        """Get records form upload session.

        Returning records and headers
        """
        try:
            url = self.attributes['url']
        except KeyError:
            raise ImporterError('url is required')

        records = []
        with requests.Session() as s:
            download = s.get(url)
            decoded_content = download.content.decode('utf-8')
            reader = csv.DictReader(
                decoded_content.splitlines(), delimiter=','
            )
            for row in list(reader):
                records.append(row)
        return records
