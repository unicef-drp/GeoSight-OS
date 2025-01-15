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

import csv
import urllib.parse

from django.contrib.auth import get_user_model
from django.test.client import MULTIPART_CONTENT
from django.urls import reverse

from core.models.group import GeosightGroup
from core.settings.utils import ABS_PATH
from core.tests.model_factories import create_user
from geosight.permission.models.factory import PERMISSIONS
from geosight.permission.tests._base import BasePermissionTest

User = get_user_model()


class GroupPermissionTest(BasePermissionTest.TestCase):
    """Test for Group API."""

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
        self.resource_1 = GeosightGroup.permissions.create(
            user=self.resource_creator,
            name='Name A'
        )
        self.resource_2 = GeosightGroup.permissions.create(
            user=self.resource_creator,
            name='Name B'
        )
        self.resource_3 = GeosightGroup.permissions.create(
            user=self.resource_creator,
            name='Name C'
        )
        self.resource_3.permission.update_user_permission(
            self.creator, PERMISSIONS.LIST
        )
        self.resource_3.permission.update_group_permission(
            self.group, PERMISSIONS.OWNER
        )

    def test_list_api_by_permission(self):
        """Test List API."""
        url = reverse('groups-list')
        self.assertRequestGetView(url, 200)
        response = self.assertRequestGetView(url, 200, user=self.viewer)
        self.assertEqual(len(response.json()['results']), 5)
        response = self.assertRequestGetView(url, 200, user=self.creator)
        self.assertEqual(len(response.json()['results']), 5)
        response = self.assertRequestGetView(
            url, 200, user=self.creator_in_group
        )
        self.assertEqual(len(response.json()['results']), 5)
        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertEqual(len(response.json()['results']), 5)

    def test_list_api_by_filter(self):
        """Test GET LIST API."""
        params = urllib.parse.urlencode(
            {
                'name__contains': 'ame C'
            }
        )
        url = reverse('groups-list') + '?' + params
        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertEqual(len(response.json()['results']), 1)
        self.assertEqual(
            response.json()['results'][0]['id'], self.resource_3.id
        )

    def test_create_api(self):
        """Test POST API."""
        url = reverse('groups-list') + '?fields=__all__'
        self.assertRequestPostView(url, 403, data={})
        self.assertRequestPostView(url, 403, user=self.viewer, data={})
        self.assertRequestPostView(
            url, 403,
            user=self.creator,
            data={
                "name": 'New name'
            },
            content_type=self.JSON_CONTENT
        )
        response = self.assertRequestPostView(
            url, 201,
            user=self.admin,
            data={
                "name": 'New name'
            },
            content_type=self.JSON_CONTENT
        )
        obj = GeosightGroup.objects.get(id=response.json()['id'])
        self.assertEqual(obj.name, 'New name')
        self.assertEqual(response.json()['name'], 'New name')

    def test_detail_api(self):
        """Test GET DETAIL API."""
        url = reverse('groups-detail', args=[0])
        self.assertRequestGetView(url, 403)
        self.assertRequestGetView(url, 403, user=self.viewer)
        self.assertRequestGetView(url, 403, user=self.creator)
        self.assertRequestGetView(url, 404, user=self.admin)

        url = reverse(
            'groups-detail', kwargs={'id': self.resource_3.id}
        )
        self.assertRequestGetView(url, 403)
        self.assertRequestGetView(url, 403, user=self.viewer)
        self.assertRequestGetView(url, 403, user=self.creator)
        response = self.assertRequestGetView(url, 200, user=self.admin)

        self.assertEqual(response.json()['name'], self.resource_3.name)

    def test_update_api(self):
        """Test PUT API."""
        url = reverse('groups-detail', args=[0])
        self.assertRequestPutView(url, 403, data={})
        self.assertRequestPutView(url, 403, user=self.viewer, data={})
        self.assertRequestPutView(url, 403, user=self.creator, data={})
        self.assertRequestPutView(url, 404, user=self.admin, data={})

        url = reverse(
            'groups-detail', kwargs={'id': self.resource_3.id}
        )
        self.assertRequestPutView(url, 403, data={})
        self.assertRequestPutView(url, 403, user=self.viewer, data={})
        self.assertRequestPutView(url, 403, user=self.creator, data={})
        self.assertRequestPutView(
            url, 200,
            user=self.admin,
            data={
                "name": self.resource_3.name
            },
            content_type=self.JSON_CONTENT
        )
        self.assertEqual(
            GeosightGroup.objects.get(id=self.resource_3.id).name, 'Name C'
        )

    def test_patch_api(self):
        """Test PATCH API."""
        url = reverse('groups-detail', args=[0])
        self.assertRequestPatchView(url, 403, data={})
        self.assertRequestPatchView(url, 403, user=self.viewer, data={})
        self.assertRequestPatchView(url, 403, user=self.creator, data={})
        self.assertRequestPatchView(url, 404, user=self.admin, data={})

        url = reverse(
            'groups-detail', kwargs={'id': self.resource_3.id}
        )
        self.assertRequestPatchView(url, 403, data={})
        self.assertRequestPatchView(url, 403, user=self.viewer, data={})
        self.assertRequestPatchView(url, 403, user=self.creator, data={})
        self.assertRequestPatchView(
            url, 200,
            user=self.admin,
            data={
                "name": self.resource_3.name
            },
            content_type=self.JSON_CONTENT
        )
        self.assertEqual(
            GeosightGroup.objects.get(id=self.resource_3.id).name, 'Name C'
        )

    def test_destroy_api(self):
        """Test DESTROY API."""
        id = self.resource_1.id
        self.check_delete_resource_with_different_users(id, 'groups-detail')
        self.assertIsNone(GeosightGroup.objects.filter(id=id).first())

        id = self.resource_3.id
        self.check_delete_resource_with_different_users(id, 'groups-detail')
        self.assertIsNone(GeosightGroup.objects.filter(id=id).first())

    def test_delete_api(self):
        """Test DELETE API."""
        resource_1 = GeosightGroup.permissions.create(
            user=self.resource_creator,
            name='Name AA'
        )
        resource_2 = GeosightGroup.permissions.create(
            user=self.resource_creator,
            name='Name BA'
        )
        resource_3 = GeosightGroup.permissions.create(
            user=self.resource_creator,
            name='Name CA'
        )
        resource_1.permission.update_user_permission(
            self.creator, PERMISSIONS.SHARE
        )
        resource_2.permission.update_user_permission(
            self.creator, PERMISSIONS.LIST
        )
        resource_3.permission.update_user_permission(
            self.creator, PERMISSIONS.OWNER
        )
        params = urllib.parse.urlencode(
            {
                'sort': 'id'
            }
        )
        created_ids = [resource_1.id, resource_2.id, resource_3.id]
        url = reverse('groups-list') + '?' + params
        response = self.assertRequestGetView(
            url, 200, user=self.admin
        )
        self.assertEqual(len(response.json()['results']), 8)
        self.assertRequestDeleteView(
            url, 204, user=self.admin, data={
                'ids': created_ids
            }
        )
        response = self.assertRequestGetView(
            url, 200, user=self.admin
        )
        self.assertEqual(len(response.json()['results']), 5)
        ids = []
        for result in response.json()['results']:
            ids.append(result['id'])
        for _id in created_ids:
            self.assertFalse(_id in ids)

    def test_batch_update_member(self):
        """Test get API."""
        url = reverse(
            'groups-user-batch',
            kwargs={'id': self.group.id}
        )
        filepath = ABS_PATH(
            'core', 'tests', '_fixtures', 'batch.group.csv'
        )
        with open(filepath) as _file:
            reader = csv.DictReader(_file, delimiter=',')
            for idx, row in enumerate(list(reader)):
                create_user(
                    row['Role'],
                    password=self.password,
                    username=row['Username'],
                    first_name=row['First name'],
                    last_name=row['Last name'],
                    email=row['Email address'],
                )

        with open(filepath) as _file:
            self.assertRequestPostView(
                url, 200, {'file': _file}, user=self.admin,
                content_type=MULTIPART_CONTENT
            )
        _file.close()
        with open(filepath) as _file:
            reader = csv.DictReader(_file, delimiter=',')
            for idx, row in enumerate(list(reader)):
                user = self.group.user_set.get(username=row['Username'])
                self.assertEqual(user.first_name, row['First name'])
                self.assertEqual(user.last_name, row['Last name'])
                self.assertEqual(user.profile.role, row['Role'])
