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

import csv
import json

from core.tests.base_tests import TenantTestCase as TestCase
from django.urls import reverse

from core.models.group import GeosightGroup
from core.models.profile import ROLES
from core.settings.utils import ABS_PATH
from core.tests.base_tests import BaseTest
from core.tests.model_factories import create_user


class GroupApiTest(BaseTest, TestCase):
    """Test for api key."""

    def setUp(self):
        """To setup test."""
        self.admin = create_user(
            ROLES.SUPER_ADMIN.name, password=self.password
        )
        self.creator = create_user(
            ROLES.CREATOR.name, password=self.password
        )
        self.group = GeosightGroup.objects.create(
            name='group 1'
        )
        self.group_2 = GeosightGroup.objects.create(
            name='group 2'
        )

    def test_list_api(self):
        """Test get API."""
        url = reverse('group-list-api')
        self.assertRequestGetView(url, 403)  # Non login
        response = self.assertRequestGetView(
            url, 200, user=self.admin
        )  # Admin
        self.assertEqual(len(response.json()), 3)
        self.assertRequestGetView(url, 200, user=self.creator)  # Creator
        self.assertEqual(len(response.json()), 3)

    def test_post_delete_api(self):
        """Test get API."""
        url = reverse('group-list-api')
        data = {
            'ids': [self.group_2.id]
        }
        self.assertRequestDeleteView(url, 403, data=data)  # Non login
        self.assertRequestDeleteView(
            url, 403, user=self.creator, data={
                'ids': json.dumps([self.group_2.id])
            }
        )  # Creator
        self.assertRequestDeleteView(
            url, 200, user=self.admin, data=data
        )  # Admin

        # Check
        url = reverse('group-list-api')
        response = self.assertRequestGetView(
            url, 200, user=self.admin
        )  # Admin
        self.assertEqual(len(response.json()), 2)
        self.assertRequestGetView(url, 200, user=self.creator)  # Creator
        self.assertEqual(len(response.json()), 2)

    def test_get_api(self):
        """Test get API."""
        url = reverse('group-detail-api', kwargs={'pk': self.group.id})
        self.assertRequestGetView(url, 403)  # Non login
        response = self.assertRequestGetView(
            url, 200, user=self.admin
        )  # Admin
        self.assertEqual(response.json()['name'], 'group 1')
        response = self.assertRequestGetView(
            url, 200, user=self.creator
        )  # Owner
        self.assertEqual(response.json()['name'], 'group 1')

    def test_delete_api(self):
        """Test get API."""
        url = reverse('group-detail-api', kwargs={'pk': self.group.id})
        self.assertRequestDeleteView(url, 403)  # Non login
        self.assertRequestDeleteView(url, 403, user=self.creator)  # Owner
        self.assertRequestDeleteView(url, 200, user=self.admin)  # Owner
        url = reverse('group-detail-api', kwargs={'pk': self.group.id})
        self.assertRequestGetView(url, 404, user=self.admin)  # Admin

    def test_batch_update_member(self):
        """Test get API."""
        url = reverse(
            'group-batch-update-user-api',
            kwargs={'pk': self.group.id}
        )
        filepath = ABS_PATH(
            'core', 'tests', '_fixtures', 'batch.group.csv'
        )

        with open(filepath) as _file:
            self.assertRequestPostView(
                url, 200, {'file': _file}, user=self.admin
            )
        _file.close()
        with open(filepath) as _file:
            reader = csv.DictReader(_file, delimiter=',')
            for idx, row in enumerate(list(reader)):
                user = self.group.user_set.get(username=row['Username'])
                self.assertEqual(user.first_name, row['First name'])
                self.assertEqual(user.last_name, row['Last name'])
                self.assertEqual(user.profile.role, row['Role'])
