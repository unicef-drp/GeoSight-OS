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
__date__ = '15/01/2025'
__copyright__ = ('Copyright 2025, Unicef')

import urllib.parse

from django.contrib.auth import get_user_model
from django.urls import reverse

from core.tests.model_factories import create_user
from geosight.permission.tests._base import BasePermissionTest

User = get_user_model()


class UserPermissionTest(BasePermissionTest.TestCase):
    """Test for User API."""

    role = 'Viewer'

    def create_resource(self, user):
        """Create resource function."""
        return None

    def get_resources(self, user):
        """Create resource function."""
        return None

    def setUp(self):
        """To setup test."""
        super().setUp()

        # Resource layer attribute
        self.resource_1 = create_user(self.role, first_name='Name A')
        self.resource_2 = create_user(self.role, first_name='Name B')
        self.resource_3 = create_user(self.role, first_name='Name C')

    def test_list_api_by_permission(self):
        """Test List API."""
        url = reverse('users-list')
        self.assertRequestGetView(url, 200)
        response = self.assertRequestGetView(url, 200, user=self.viewer)
        self.assertEqual(len(response.json()['results']), 12)
        response = self.assertRequestGetView(url, 200, user=self.creator)
        self.assertEqual(len(response.json()['results']), 12)
        response = self.assertRequestGetView(
            url, 200, user=self.creator_in_group
        )
        self.assertEqual(len(response.json()['results']), 12)
        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertEqual(len(response.json()['results']), 12)

    def test_list_api_by_filter(self):
        """Test GET LIST API."""
        params = urllib.parse.urlencode(
            {
                'first_name__contains': 'ame C'
            }
        )
        url = reverse('users-list') + '?' + params
        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertEqual(len(response.json()['results']), 1)
        self.assertEqual(
            response.json()['results'][0]['id'], self.resource_3.id
        )

    def test_create_api(self):
        """Test POST API."""
        url = reverse('users-list') + '?fields=__all__'
        self.assertRequestPostView(url, 403, data={})
        self.assertRequestPostView(url, 403, user=self.viewer, data={})
        self.assertRequestPostView(
            url, 403,
            user=self.creator,
            data={
                "first_name": 'New name'
            },
            content_type=self.JSON_CONTENT
        )
        response = self.assertRequestPostView(
            url, 201,
            user=self.admin,
            data={
                "username": "test",
                "first_name": 'New name'
            },
            content_type=self.JSON_CONTENT
        )
        obj = User.objects.get(id=response.json()['id'])
        self.assertEqual(obj.first_name, 'New name')
        self.assertEqual(response.json()['first_name'], 'New name')

    def test_detail_api(self):
        """Test GET DETAIL API."""
        url = reverse('users-detail', args=[0])
        self.assertRequestGetView(url, 403)
        self.assertRequestGetView(url, 403, user=self.viewer)
        self.assertRequestGetView(url, 403, user=self.creator)
        self.assertRequestGetView(url, 404, user=self.admin)

        url = reverse(
            'users-detail', kwargs={'id': self.resource_3.id}
        )
        self.assertRequestGetView(url, 403)
        self.assertRequestGetView(url, 403, user=self.viewer)
        self.assertRequestGetView(url, 403, user=self.creator)
        response = self.assertRequestGetView(url, 200, user=self.admin)

        self.assertEqual(
            response.json()['first_name'], self.resource_3.first_name
        )

    def test_update_api(self):
        """Test PUT API."""
        url = reverse('users-detail', args=[0])
        self.assertRequestPutView(url, 403, data={})
        self.assertRequestPutView(url, 403, user=self.viewer, data={})
        self.assertRequestPutView(url, 403, user=self.creator, data={})
        self.assertRequestPutView(url, 404, user=self.admin, data={})

        url = reverse(
            'users-detail', kwargs={'id': self.resource_3.id}
        )
        self.assertRequestPutView(url, 403, data={})
        self.assertRequestPutView(url, 403, user=self.viewer, data={})
        self.assertRequestPutView(url, 403, user=self.creator, data={})
        self.assertRequestPutView(
            url, 200,
            user=self.admin,
            data={
                "username": self.resource_3.username,
                "first_name": self.resource_3.first_name
            },
            content_type=self.JSON_CONTENT
        )
        self.assertEqual(
            User.objects.get(id=self.resource_3.id).first_name, 'Name C'
        )

    def test_patch_api(self):
        """Test PATCH API."""
        url = reverse('users-detail', args=[0])
        self.assertRequestPatchView(url, 403, data={})
        self.assertRequestPatchView(url, 403, user=self.viewer, data={})
        self.assertRequestPatchView(url, 403, user=self.creator, data={})
        self.assertRequestPatchView(url, 404, user=self.admin, data={})

        url = reverse(
            'users-detail', kwargs={'id': self.resource_3.id}
        )
        self.assertRequestPatchView(url, 403, data={})
        self.assertRequestPatchView(url, 403, user=self.viewer, data={})
        self.assertRequestPatchView(url, 403, user=self.creator, data={})
        self.assertRequestPatchView(
            url, 200,
            user=self.admin,
            data={
                "first_name": self.resource_3.first_name
            },
            content_type=self.JSON_CONTENT
        )
        self.assertEqual(
            User.objects.get(id=self.resource_3.id).first_name, 'Name C'
        )

    def test_destroy_api(self):
        """Test DESTROY API."""
        id = self.resource_1.id
        self.check_delete_resource_with_different_users(id, 'users-detail')
        self.assertIsNone(User.objects.filter(id=id).first())

        id = self.resource_3.id
        self.check_delete_resource_with_different_users(id, 'users-detail')
        self.assertIsNone(User.objects.filter(id=id).first())

    def test_delete_api(self):
        """Test DELETE API."""
        resource_1 = create_user(self.role, first_name='Name AA')
        resource_2 = create_user(self.role, first_name='Name AB')
        resource_3 = create_user(self.role, first_name='Name AC')
        params = urllib.parse.urlencode(
            {
                'sort': 'id'
            }
        )
        created_ids = [resource_1.id, resource_2.id, resource_3.id]
        url = reverse('users-list') + '?' + params
        response = self.assertRequestGetView(
            url, 200, user=self.admin
        )
        self.assertEqual(len(response.json()['results']), 15)
        self.assertRequestDeleteView(
            url, 204, user=self.admin, data={
                'ids': created_ids
            }
        )
        response = self.assertRequestGetView(
            url, 200, user=self.admin
        )
        self.assertEqual(len(response.json()['results']), 12)
        ids = []
        for result in response.json()['results']:
            ids.append(result['id'])
        for _id in created_ids:
            self.assertFalse(_id in ids)
