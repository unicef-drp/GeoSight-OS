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

import json

from django.contrib.auth import get_user_model
from core.tests.base_tests import TestCase
from django.urls import reverse

from geosight.data.models import Style
from geosight.permission.tests._base import BasePermissionTest

User = get_user_model()


class StyleApiTest(BasePermissionTest, TestCase):
    """Test for Style api."""

    def create_resource(self, user, name='name'):
        """Create resource function."""
        obj, _ = Style.objects.get_or_create(
            name=name
        )
        return obj

    def get_resources(self, user):
        """Create resource function."""
        return Style.objects.order_by('id')

    def test_list_api(self):
        """Test list API."""
        url = reverse('style-list-api')
        response = self.assertRequestGetView(url, 200)  # Non login
        self.assertEqual(len(response.json()), 1)
        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertEqual(len(response.json()), 1)

    def test_delete_multiple_api(self):
        """Test list API."""
        resource = self.create_resource(self.creator)
        url = reverse('style-list-api')
        self.assertRequestDeleteView(
            url, 403, self.viewer, data={'ids': json.dumps([resource.id])}
        )
        self.assertEqual(Style.objects.count(), 1)
        self.assertRequestDeleteView(
            url, 200, self.admin, data={'ids': json.dumps([resource.id])}
        )
        self.assertEqual(Style.objects.count(), 0)

    def test_delete_api(self):
        """Test list API."""
        resource = self.create_resource(self.creator, 'name 1')
        url = reverse('style-detail-api', kwargs={'pk': resource.id})
        self.assertRequestDeleteView(url, 403)
        self.assertRequestDeleteView(url, 403, self.viewer)
        self.assertRequestDeleteView(url, 403, self.contributor)
        self.assertRequestDeleteView(url, 403, self.resource_creator)
        self.assertRequestDeleteView(url, 200, self.admin)
        self.assertEqual(Style.objects.count(), 1)
