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
__date__ = '20/11/2023'
__copyright__ = ('Copyright 2023, Unicef')

from unittest.mock import patch

from core.tests.base_tests import TenantTestCase as TestCase
from django.utils import timezone

from geosight.data.forms.arcgis import ArcgisConfigForm


class ArcgisConfigTest(TestCase):
    """Test for ArcGis model."""

    generate_token_url = 'http://arcgis.test.com/generate_url'
    username = 'username'
    password = 'password'
    token = 'token'

    def request_generate_token(
            self, generate_token_url: str, username: str, password: str
    ):
        """Mock for get entity request."""
        if generate_token_url == self.generate_token_url \
                and username == self.username and password == self.password:
            return 'token', self.expires
        else:
            raise Exception('This is error')

    def setUp(self):
        """To setup tests."""
        self.expires = timezone.now()
        self.expires.replace(year=self.expires.year + 1)

        self.request_generate_token_path = patch(
            'geosight.data.models.arcgis.ArcgisConfig.request_generate_token',
            self.request_generate_token
        )
        self.request_generate_token_path.start()
        super().setUp()

    def tearDown(self):
        """Stop the patcher."""
        self.request_generate_token_path.stop()

    def test_create(self):
        """Test create."""
        data = {
            'name': 'ArcGis test',
            'generate_token_url': self.generate_token_url,
            'username': self.username,
            'password': self.password,
        }
        form = ArcgisConfigForm(data)
        self.assertTrue(form.is_valid())
        instance = form.save()
        self.assertEqual(instance.username, self.username)
        self.assertNotEqual(instance.password, self.password)
        self.assertEqual(instance.password_val, self.password)
        self.assertEqual(instance.token_val, 'token')
        self.assertNotEqual(instance.token, 'token')
        self.assertEqual(instance.expires, self.expires)

    def test_error(self):
        """Test create."""
        data = {
            'name': 'ArcGis test',
            'generate_token_url': self.generate_token_url,
            'username': 'test',
            'password': self.password,
        }
        form = ArcgisConfigForm(data)
        self.assertFalse(form.is_valid())
