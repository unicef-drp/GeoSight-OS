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

import requests

from geosight.importer.attribute import ImporterAttribute
from geosight.importer.exception import ImporterError
from geosight.importer.utilities import get_data_from_record


class BaseAPIImporter(ABC):
    """Import data from api."""

    attributes = {}
    mapping = {}

    @staticmethod
    def attributes_definition(**kwargs) -> List[ImporterAttribute]:
        """Return attributes of the importer."""
        from geosight.importer.attribute import ImporterAttributeInputType
        return [
            ImporterAttribute(
                name='api_url',
                input_type=ImporterAttributeInputType.TEXT
            ),
            ImporterAttribute(
                name='key_feature_list',
                input_type=ImporterAttributeInputType.TEXT,
                required=False
            )
        ]

    def eval_json(self, json, key) -> List:
        """Evaluate json."""
        key = 'json' + ''.join([f'["{_key}"]' for _key in key.split('.')])
        return eval(key)

    def get_records(self) -> List:
        """Get records form upload session.

        Returning records and headers
        """
        api_url = self.attributes.get('api_url', None)
        key_feature_list = self.attributes.get('key_feature_list', None)
        if not api_url:
            raise ImporterError('api_url is required')
        if not key_feature_list:
            raise ImporterError('key_feature_list is required')

        self._update('Fetching data.')
        try:
            response = requests.get(api_url)
            response.raise_for_status()
            json = response.json()
            try:
                records = self.eval_json(json, key_feature_list)
                for record in records:
                    for key, value in self.mapping.items():
                        try:
                            record[value] = get_data_from_record(key, record)
                        except KeyError:
                            pass
                self._update('Format data.')
                return records

            except KeyError as e:
                raise ImporterError(f'{e}.')
        except (
                requests.exceptions.RequestException,
                requests.exceptions.HTTPError) as e:
            raise ImporterError(f'{e}')
