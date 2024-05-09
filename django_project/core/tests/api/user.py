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
__date__ = '24/10/2023'
__copyright__ = ('Copyright 2023, Unicef')

import json

from core.tests.base_tests import TenantTestCase as TestCase
from django.urls import reverse

from core.models.profile import ROLES
from core.tests.base_tests import BaseTest
from core.tests.model_factories import create_user


class UserApiTest(BaseTest, TestCase):
    """Test for api key."""

    def setUp(self):
        """To setup test."""
        self.admin = create_user(
            ROLES.SUPER_ADMIN.name, password=self.password
        )
        self.creator = create_user(
            ROLES.CREATOR.name, password=self.password
        )
        self.user_1 = create_user(
            ROLES.CREATOR.name, password=self.password
        )
        self.user_2 = create_user(
            ROLES.CREATOR.name, password=self.password
        )

    def test_list_api(self):
        """Test get API."""
        url = reverse('user-list-api')
        self.assertRequestGetView(url, 403)  # Non login
        response = self.assertRequestGetView(
            url, 200, user=self.admin
        )  # Admin
        self.assertEqual(len(response.json()), 5)
        self.assertRequestGetView(url, 200, user=self.creator)  # Creator
        self.assertEqual(len(response.json()), 5)

    def test_post_delete_api(self):
        """Test get API."""
        url = reverse('user-list-api')
        data = {
            'ids': [self.user_2.id]
        }
        self.assertRequestDeleteView(url, 403, data=data)  # Non login
        self.assertRequestDeleteView(
            url, 403, user=self.creator, data={
                'ids': json.dumps([self.user_2.id])
            }
        )  # Creator
        self.assertRequestDeleteView(
            url, 200, user=self.admin, data=data
        )  # Admin

        # Check
        url = reverse('user-list-api')
        response = self.assertRequestGetView(
            url, 200, user=self.admin
        )  # Admin
        self.assertEqual(len(response.json()), 4)
        self.assertRequestGetView(url, 200, user=self.creator)  # Creator
        self.assertEqual(len(response.json()), 4)

    def test_get_api(self):
        """Test get API."""
        url = reverse('user-detail-api', kwargs={'pk': self.user_1.id})
        self.assertRequestGetView(url, 403)  # Non login
        self.assertRequestGetView(url, 403, user=self.creator)  # Owner
        response = self.assertRequestGetView(
            url, 200, user=self.admin
        )  # Admin
        self.assertEqual(response.json()['username'], self.user_1.username)

    def test_delete_api(self):
        """Test get API."""
        url = reverse('user-detail-api', kwargs={'pk': self.user_1.id})
        self.assertRequestDeleteView(url, 403)  # Non login
        self.assertRequestDeleteView(url, 403, user=self.creator)  # Owner
        self.assertRequestDeleteView(url, 200, user=self.admin)  # Owner
        url = reverse('user-detail-api', kwargs={'pk': self.user_1.id})
        self.assertRequestGetView(url, 404, user=self.admin)  # Admin
