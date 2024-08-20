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

from core.tests.base_tests import TestCase
from django.urls import reverse

from core.models.profile import ROLES
from core.tests.base_tests import BaseTest
from core.tests.model_factories import create_user


class ApiKeyApiTest(BaseTest, TestCase):
    """Test for api key."""

    def setUp(self):
        """To setup test."""
        self.admin = create_user(
            ROLES.SUPER_ADMIN.name, password=self.password
        )
        self.user = create_user(
            ROLES.CREATOR.name, password=self.password
        )

    def test_get_api(self):
        """Test get API."""
        url = reverse('user-api-key', kwargs={'pk': self.user.id})
        self.assertRequestGetView(url, 403)  # Non login
        self.assertRequestGetView(url, 403, user=self.admin)  # Admin
        self.assertRequestGetView(url, 200, user=self.user)  # Owner

    def test_post_api(self):
        """Test get API."""
        url = reverse('user-api-key', kwargs={'pk': self.user.id})
        self.assertRequestPostView(url, 403, data={})  # Non login
        self.assertRequestPostView(url, 403, user=self.admin, data={})  # Admin
        response = self.assertRequestPostView(
            url, 201, user=self.user, data={}
        )  # Owner
        self.assertTrue('api_key' in response.json().keys())
        response = self.assertRequestGetView(url, 200, user=self.user)
        self.assertEqual(len(response.json()), 1)

        # Create second one
        self.assertRequestPostView(
            url, 400, user=self.user, data={}
        )  # Owner

    def test_put_api(self):
        """Test get API."""
        url = reverse('user-api-key', kwargs={'pk': self.user.id})
        self.assertRequestGetView(url, 403)  # Non login
        self.assertRequestGetView(url, 403, user=self.admin)  # Admin
        self.assertRequestGetView(url, 200, user=self.user)  # Owner

    def test_delete_api(self):
        """Test get API."""
        url = reverse('user-api-key', kwargs={'pk': self.user.id})
        self.assertRequestDeleteView(url, 403)  # Non login
        self.assertRequestDeleteView(url, 403, user=self.admin)  # Admin
        self.assertRequestDeleteView(url, 404, user=self.user)  # Owner
        self.assertRequestPostView(
            url, 201, user=self.user, data={}
        )  # Owner
        self.assertRequestDeleteView(url, 204, user=self.user)  # Owner
