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
__date__ = '02/01/2024'
__copyright__ = ('Copyright 2023, Unicef')

from unittest.mock import patch

from django.contrib.auth import get_user_model
from core.tests.base_tests import TenantTestCase as TestCase
from django.urls import reverse

from geosight.data.models.sharepoint import SharepointConfig
from geosight.permission.tests._base import BasePermissionTest
from .mock import load_file

User = get_user_model()


class SharepointApiTest(BasePermissionTest, TestCase):
    """Test for sharepoint fetch api."""

    def create_resource(self, user):
        """Create resource function."""
        return

    def get_resources(self, user):
        """Create resource function."""
        return

    def setUp(self):
        """To setup test."""
        self.sharepoint_1 = SharepointConfig.objects.create(
            name='Sharepoint 1',
            url='https://sharepoint.com/test/1/',
            client_id='client_id',
            client_secret='client_secret'
        )
        self.sharepoint_2 = SharepointConfig.objects.create(
            name='Sharepoint 2',
            url='https://sharepoint.com/test/2/',
            client_id='client_id',
            client_secret='client_secret'
        )
        super().setUp()

        # Patch
        self.entity_patcher = patch(
            'geosight.data.models.sharepoint.SharepointConfig.load_file',
            load_file
        )
        self.entity_patcher.start()

    def test_sharepoint_list(self):
        """Test list API."""
        url = reverse('sharepoint-config-list-api')
        self.assertRequestGetView(url, 403)
        self.assertRequestGetView(url, 403, self.viewer)
        response = self.assertRequestGetView(url, 200, self.contributor)
        self.assertEqual(len(response.json()), 2)
        self.assertTrue('Sharepoint 1' in response.json()[0]['full_name'])
        self.assertTrue('Sharepoint 2' in response.json()[1]['full_name'])

    def test_fetch_info_list(self):
        """Test fetch API."""
        url = reverse('sharepoint-fetch-info-api', args=[0])
        self.assertRequestPostView(url, 403, {})
        self.assertRequestPostView(url, 403, {}, self.viewer)
        self.assertRequestPostView(url, 404, {}, self.contributor)

        url = reverse('sharepoint-fetch-info-api', args=[self.sharepoint_1.pk])
        response = self.assertRequestPostView(url, 400, {}, self.contributor)
        self.assertEqual(
            response.content, b"'relative_url' is required in payload"
        )
        response = self.assertRequestPostView(
            url, 400, {'relative_url': 'not_found.xls'}, self.contributor
        )
        self.assertEqual(response.content, b'File does not exist')
        response = self.assertRequestPostView(
            url, 200,
            {
                'relative_url': 'test.xlsx', 'row_number_for_header': 1
            },
            self.contributor
        )
        self.assertEqual(
            response.json()['Test 1']['headers'],
            [
                'geom_code', 'indicator_shortcode', 'value', 'date',
                'time', 'date_time', 'admin_level'
            ]
        )
        self.assertEqual(
            response.json()['Test 2']['headers'],
            ['String 1', 'String 2', 'Number']
        )

    def tearDown(self):
        """Stop the patcher."""
        super().tearDown()
        self.entity_patcher.stop()
