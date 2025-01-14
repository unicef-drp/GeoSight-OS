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
__date__ = '08/01/2025'
__copyright__ = ('Copyright 2025, Unicef')

import urllib.parse

from django.contrib.auth import get_user_model
from django.urls import reverse

from geosight.data.models.dashboard import Dashboard, DashboardGroup
from geosight.permission.models.factory import PERMISSIONS
from geosight.permission.tests._base import BasePermissionTest

User = get_user_model()


class DashboardPermissionTest(BasePermissionTest.TestCase):
    """Test for Dashboard API."""

    def setUp(self):
        """To setup test."""
        super().setUp()

        # Resource layer attribute
        self.resource_1 = Dashboard.permissions.create(
            user=self.resource_creator,
            name='Name A',
            group=DashboardGroup.objects.create(name='Group 1')
        )
        self.resource_2 = Dashboard.permissions.create(
            user=self.resource_creator,
            name='Name B',
            group=DashboardGroup.objects.create(name='Group 2'),
            description='This is test'
        )
        self.resource_3 = Dashboard.permissions.create(
            user=self.resource_creator,
            name='Name C',
            group=DashboardGroup.objects.create(name='Group 3'),
            description='Resource 3'
        )
        self.resource_3.permission.update_user_permission(
            self.creator, PERMISSIONS.LIST
        )
        self.resource_3.permission.update_group_permission(
            self.group, PERMISSIONS.OWNER
        )

    def create_resource(self, user):
        """Create resource function."""
        return None

    def get_resources(self, user):
        """Create resource function."""
        return None

    def test_list_api_by_permission(self):
        """Test List API."""
        url = reverse('dashboards-list')
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
        url = reverse('dashboards-list') + '?' + params
        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertEqual(len(response.json()['results']), 1)
        self.assertEqual(
            response.json()['results'][0]['id'], self.resource_3.slug
        )

        params = urllib.parse.urlencode(
            {
                'description__contains': 'test'
            }
        )
        url = reverse('dashboards-list') + '?' + params
        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertEqual(len(response.json()['results']), 1)
        self.assertEqual(
            response.json()['results'][0]['id'], self.resource_2.slug
        )

        params = urllib.parse.urlencode(
            {
                'category__name__in': 'Group 1,Group 2'
            }
        )
        url = reverse('dashboards-list') + '?' + params
        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertEqual(len(response.json()['results']), 2)
        for result in response.json()['results']:
            self.assertTrue(
                result['id'] in [self.resource_1.slug, self.resource_2.slug])

        # Not contains
        params = urllib.parse.urlencode(
            {
                'category__name__in': '!Group 1,Group 2'
            }
        )
        url = reverse('dashboards-list') + '?' + params
        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertEqual(len(response.json()['results']), 1)
        for result in response.json()['results']:
            self.assertTrue(
                result['id'] in [self.resource_3.slug])

    def test_list_api_sort(self):
        """Test GET LIST API."""
        params = urllib.parse.urlencode(
            {
                'sort': 'name'
            }
        )
        url = reverse('dashboards-list') + '?' + params
        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertEqual(len(response.json()['results']), 3)
        ids = []
        for result in response.json()['results']:
            ids.append(result['id'])
        self.assertEqual(
            ids, [
                self.resource_1.slug, self.resource_2.slug,
                self.resource_3.slug
            ]
        )
        params = urllib.parse.urlencode(
            {
                'sort': '-name'
            }
        )
        url = reverse('dashboards-list') + '?' + params
        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertEqual(len(response.json()['results']), 3)
        ids = []
        for result in response.json()['results']:
            ids.append(result['id'])
        self.assertEqual(
            ids, [
                self.resource_3.slug, self.resource_2.slug,
                self.resource_1.slug
            ]
        )

    def test_detail_api(self):
        """Test GET DETAIL API."""
        url = reverse('dashboards-detail', args=['name-a'])
        self.assertRequestGetView(url, 403)
        self.assertRequestGetView(url, 403, user=self.viewer)
        self.assertRequestGetView(url, 403, user=self.creator)
        self.assertRequestGetView(url, 200, user=self.resource_creator)
        self.assertRequestGetView(url, 200, user=self.admin)

        url = reverse(
            'dashboards-detail', kwargs={'slug': self.resource_3.slug}
        )
        self.assertRequestGetView(url, 403)
        self.assertRequestGetView(url, 403, user=self.viewer)
        self.assertRequestGetView(url, 403, user=self.creator)
        response = self.assertRequestGetView(url, 200, user=self.admin)

        self.assertEqual(response.json()['name'], self.resource_3.name)
        self.assertEqual(
            response.json()['created_by'], self.resource_3.creator.username
        )

    def test_delete_api(self):
        """Test DELETE API."""
        slug = self.resource_1.slug
        self.check_delete_resource_with_different_users(
            slug, 'dashboards-detail')
        self.assertIsNone(Dashboard.objects.filter(slug=slug).first())

        slug = self.resource_3.slug
        self.check_delete_resource_with_different_users(
            slug, 'dashboards-detail'
        )
        self.assertIsNone(Dashboard.objects.filter(slug=slug).first())

    def test_list_group(self):
        """Test list dashboarg group for user API."""
        url = reverse('dashboard-groups-api')
        self.assertRequestGetView(url, 200)

        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertEqual(len(response.json()), 3)
        groups = list(
            Dashboard.objects.values_list(
                'group__name', flat=True
            ).distinct()
        )
        self.assertEqual(groups, groups)

        response = self.assertRequestGetView(url, 200, user=self.viewer)
        self.assertEqual(len(response.json()), 0)

        response = self.assertRequestGetView(url, 200, user=self.creator)
        self.assertEqual(len(response.json()), 1)

        response = self.assertRequestGetView(
            url, 200, user=self.creator_in_group
        )
        self.assertEqual(response.json(), ['Group 3'])
