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

import os
from io import BytesIO
from unittest.mock import patch

from core.settings.utils import ABS_PATH
from geosight.data.models.sharepoint import SharepointConfig
from geosight.importer.tests.importers._base import (
    BaseImporterTest, BaseIndicatorValueImporterTest
)


def mock_sharepoint_request(self: SharepointConfig, relative_url: str):
    """Mock for sharepoint request."""
    with open(os.path.join(self.url, relative_url), "rb") as fh:
        return BytesIO(fh.read())


class BaseSharepointTest(BaseImporterTest):
    """Base for Sharepoint Importer."""

    attributes = {}

    def setUp(self):
        """To setup tests."""
        super().setUp()

        self.sharepoint_config = SharepointConfig.objects.create(
            name='test',
            url=ABS_PATH(
                'geosight', 'importer', 'tests', 'importers', '_fixtures'
            ),
            client_id='test',
            client_secret='test'

        )
        self.attributes['sharepoint_config_id'] = self.sharepoint_config.id

        # Patch
        self.patcher = patch(
            'geosight.data.models.sharepoint.SharepointConfig.load_file',
            mock_sharepoint_request
        )
        self.mock_foo = self.patcher.start()

    def tearDown(self):
        """Stop the patcher."""
        self.patcher.stop()
        super().tearDown()
        self.entity_patcher.stop()


class BaseSharepointIndicatorValueTest(
    BaseIndicatorValueImporterTest, BaseSharepointTest
):
    """Base for Sharepoint Importer."""

    pass
