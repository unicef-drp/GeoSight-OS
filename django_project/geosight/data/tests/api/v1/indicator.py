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
__date__ = '09/01/2025'
__copyright__ = ('Copyright 2025, Unicef')

import urllib.parse

from django.contrib.auth import get_user_model
from django.urls import reverse

from geosight.data.models.indicator import Indicator, IndicatorGroup
from geosight.permission.models.factory import PERMISSIONS
from geosight.permission.tests._base import BasePermissionTest

User = get_user_model()


class IndicatorPermissionTest(BasePermissionTest.TestCase):
    """Test for Indicator API."""

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
        self.resource_1 = Indicator.permissions.create(
            user=self.resource_creator,
            name='Name A',
            group=IndicatorGroup.objects.create(name='Group 1')
        )
        self.resource_2 = Indicator.permissions.create(
            user=self.resource_creator,
            name='Name B',
            group=IndicatorGroup.objects.create(name='Group 2'),
            description='This is test'
        )
        self.resource_3 = Indicator.permissions.create(
            user=self.resource_creator,
            name='Name C',
            group=IndicatorGroup.objects.create(name='Group 3'),
            description='Resource 3'
        )
        self.resource_3.permission.update_user_permission(
            self.creator, PERMISSIONS.LIST
        )
        self.resource_3.permission.update_group_permission(
            self.group, PERMISSIONS.OWNER
        )

    def test_list_api_by_permission(self):
        """Test List API."""
        url = reverse('indicators-list')
        self.assertRequestGetView(url, 200)

        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertEqual(len(response.json()['results']), 3)

        response = self.assertRequestGetView(url, 200, user=self.viewer)
        self.assertEqual(len(response.json()['results']), 0)

        response = self.assertRequestGetView(url, 200, user=self.creator)
        self.assertEqual(len(response.json()['results']), 1)

        response = self.assertRequestGetView(
            url, 200, user=self.creator_in_group
        )
        self.assertEqual(len(response.json()['results']), 1)

    def test_list_api_by_filter(self):
        """Test GET LIST API."""
        params = urllib.parse.urlencode(
            {
                'name__contains': 'ame C'
            }
        )
        url = reverse('indicators-list') + '?' + params
        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertEqual(len(response.json()['results']), 1)
        self.assertEqual(
            response.json()['results'][0]['id'], self.resource_3.id
        )

        params = urllib.parse.urlencode(
            {
                'description__contains': 'test'
            }
        )
        url = reverse('indicators-list') + '?' + params
        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertEqual(len(response.json()['results']), 1)
        self.assertEqual(
            response.json()['results'][0]['id'], self.resource_2.id
        )

        params = urllib.parse.urlencode(
            {
                'category__name__in': 'Group 1,Group 2'
            }
        )
        url = reverse('indicators-list') + '?' + params
        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertEqual(len(response.json()['results']), 2)
        for result in response.json()['results']:
            self.assertTrue(
                result['id'] in [self.resource_1.id, self.resource_2.id])

        # Not contains
        params = urllib.parse.urlencode(
            {
                'category__name__in': '!Group 1,Group 2'
            }
        )
        url = reverse('indicators-list') + '?' + params
        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertEqual(len(response.json()['results']), 1)
        for result in response.json()['results']:
            self.assertTrue(
                result['id'] in [self.resource_3.id])

    def test_list_api_sort(self):
        """Test GET LIST API."""
        params = urllib.parse.urlencode(
            {
                'sort': 'name'
            }
        )
        url = reverse('indicators-list') + '?' + params
        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertEqual(len(response.json()['results']), 3)
        ids = []
        for result in response.json()['results']:
            ids.append(result['id'])
        self.assertEqual(
            ids, [
                self.resource_1.id, self.resource_2.id,
                self.resource_3.id
            ]
        )
        params = urllib.parse.urlencode(
            {
                'sort': '-name'
            }
        )
        url = reverse('indicators-list') + '?' + params
        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertEqual(len(response.json()['results']), 3)
        ids = []
        for result in response.json()['results']:
            ids.append(result['id'])
        self.assertEqual(
            ids, [
                self.resource_3.id, self.resource_2.id,
                self.resource_1.id
            ]
        )

    def test_detail_api(self):
        """Test GET DETAIL API."""
        url = reverse('indicators-detail', args=[self.resource_1.id])
        self.assertRequestGetView(url, 403)
        self.assertRequestGetView(url, 403, user=self.viewer)
        self.assertRequestGetView(url, 403, user=self.creator)
        self.assertRequestGetView(url, 200, user=self.resource_creator)
        self.assertRequestGetView(url, 200, user=self.admin)

        url = reverse(
            'indicators-detail', kwargs={'id': self.resource_3.id}
        )
        self.assertRequestGetView(url, 403)
        self.assertRequestGetView(url, 403, user=self.viewer)
        self.assertRequestGetView(url, 403, user=self.creator)
        response = self.assertRequestGetView(url, 200, user=self.admin)

        self.assertEqual(response.json()['name'], self.resource_3.name)
        self.assertEqual(
            response.json()['created_by'], self.resource_3.creator.username
        )

    def test_destroy_api(self):
        """Test DESTROY API."""
        id = self.resource_1.id
        self.check_delete_resource_with_different_users(
            id, 'indicators-detail')
        self.assertIsNone(Indicator.objects.filter(id=id).first())

        id = self.resource_3.id
        self.check_delete_resource_with_different_users(
            id, 'indicators-detail'
        )
        self.assertIsNone(Indicator.objects.filter(id=id).first())

    def test_delete_api(self):
        """Test DELETE API."""
        resource_1 = Indicator.permissions.create(
            user=self.resource_creator,
            name='Name A',
            group=IndicatorGroup.objects.create(name='Group 1')
        )
        resource_2 = Indicator.permissions.create(
            user=self.resource_creator,
            name='Name B',
            group=IndicatorGroup.objects.create(name='Group 2'),
            description='This is test'
        )
        resource_3 = Indicator.permissions.create(
            user=self.resource_creator,
            name='Name C',
            group=IndicatorGroup.objects.create(name='Group 3'),
            description='Resource 3'
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
        url = reverse('indicators-list') + '?' + params
        response = self.assertRequestGetView(
            url, 200, user=self.creator
        )
        self.assertEqual(len(response.json()['results']), 4)
        self.assertRequestDeleteView(
            url, 204, user=self.creator, data={
                'ids': [resource_1.id, resource_2.id, resource_3.id]
            }
        )
        response = self.assertRequestGetView(
            url, 200, user=self.creator
        )
        self.assertEqual(len(response.json()['results']), 3)
        ids = []
        for result in response.json()['results']:
            ids.append(result['id'])
        self.assertEqual(
            ids, [
                self.resource_3.id, resource_1.id, resource_2.id
            ]
        )
