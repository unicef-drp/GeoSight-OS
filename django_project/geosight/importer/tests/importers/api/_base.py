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

import responses

from geosight.importer.tests.importers._base import (
    BaseImporterTest, BaseIndicatorValueImporterTest
)
from geosight.importer.utilities import json_from_excel


class BaseApiTest(BaseImporterTest):
    """Base for Api Importer."""

    api_url = 'http://test.com'
    attributes = {
        'api_url': api_url,
        'key_feature_list': 'features',
        'date_time_data_format': '%Y-%m-%d %H:%M:%S'
    }

    def file_response(self, excel_file, api_url=None):
        """Update file response."""
        data = json_from_excel(excel_file, 'Sheet 1')
        responses.add(
            responses.GET,
            self.api_url if not api_url else api_url,
            status=200,
            json={
                'features': data
            }
        )

    def setUp(self):
        """To setup tests."""
        super().setUp()


class BaseApiIndicatorValueTest(
    BaseIndicatorValueImporterTest, BaseApiTest
):
    """Base for Sharepoint Importer."""

    pass
