# coding=utf-8
"""
GeoSight is UNICEF’s geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""
__author__ = 'danang@kartoza.com'
__date__ = '24/07/2023'
__copyright__ = ('Copyright 2023, Unicef')

from django.test import TestCase
from django.contrib.auth import get_user_model
from azure_auth.backends import AzureAuthBackend
from azure_auth.models import RegisteredDomain

UserModel = get_user_model()


class TestAzureAuthBackend(TestCase):
    """Test for azure authentication backend."""

    def test_get_user_from_user_model(self):
        """Create live.com#test@test.com user."""
        user1 = UserModel.objects.create(
            username='test@test.com',
            email='test@test.com'
        )
        user = AzureAuthBackend.get_user_from_user_model({
            'email': 'live.com#test@test.com'
        })
        self.assertEqual(user1.id, user.id)
        user = AzureAuthBackend.get_user_from_user_model({
            'email': 'test@test.com'
        })
        self.assertEqual(user1.id, user.id)

    def test_create_new_user(self):
        """Create live.com#test@test.com new user."""
        RegisteredDomain.objects.create(
            domain='test.com'
        )
        user = AzureAuthBackend.create_new_user({
            'email': 'live.com#test@test.com'
        })
        self.assertTrue(user.id)
        self.assertEqual(user.username, 'test@test.com')
        self.assertEqual(user.email, 'test@test.com')
