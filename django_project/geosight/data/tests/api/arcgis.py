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
__date__ = '16/08/2024'
__copyright__ = ('Copyright 2023, Unicef')

import responses
from django.contrib.auth import get_user_model
from django.test.testcases import TestCase

from core.tests.base_test_patch_responses import (
    BaseTestWithPatchResponses, PatchReqeust
)
from geosight.data.models.arcgis import ArcgisConfig

User = get_user_model()


class ARCGISProxyApiTest(TestCase, BaseTestWithPatchResponses):
    """Test for Arcgis Proxy api."""
    token = 'ThisIsToken'

    mock_requests = [
        PatchReqeust(
            'https://arcgis.example.test/portal/sharing/generateToken',
            response={
                'token': token,
                'expires': 3600000,
            },
            request_method='POST'
        )
    ]

    def setUp(self):
        """To setup test."""
        self.config = ArcgisConfig.objects.create(
            name='arcgis',
            generate_token_url=(
                'https://arcgis.example.test/portal/sharing/generateToken'
            ),
            username='test',
            password='test',
        )

    @responses.activate
    def test_token_generated(self):
        """Test if token generated"""
        self.init_mock_requests()
        self.config.generate_token()
        self.assertEqual(self.config.token_val, self.token)

    @responses.activate
    def test_token_generated(self):
        """Test if token generated"""
        self.init_mock_requests()
        self.config.generate_token()
        self.assertEqual(self.config.token_val, self.token)
