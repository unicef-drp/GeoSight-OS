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

import urllib.parse

from django.contrib.auth import get_user_model
from django.urls import reverse

from core.tests.base_tests import TestCase
from geosight.data.models.basemap_layer import (
    BasemapLayer, BasemapLayerType, BasemapGroup
)
from geosight.data.models.dashboard import Dashboard, DashboardBasemap
from geosight.permission.models.factory import PERMISSIONS
from geosight.permission.tests._base import BasePermissionTest

User = get_user_model()


class BasemapPermissionTest(BasePermissionTest, TestCase):
    """Test for Basemap API."""

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
        self.resource_1 = BasemapLayer.permissions.create(
            user=self.resource_creator,
            name='Name A',
            group=BasemapGroup.objects.create(name='Group 1'),
            url='url',
            type=BasemapLayerType.XYZ_TILE
        )
        self.resource_2 = BasemapLayer.permissions.create(
            user=self.resource_creator,
            name='Name B',
            group=BasemapGroup.objects.create(name='Group 2'),
            url='url',
            description='This is test',
            type=BasemapLayerType.WMS
        )
        self.resource_3 = BasemapLayer.permissions.create(
            user=self.resource_creator,
            name='Name C',
            group=BasemapGroup.objects.create(name='Group 3'),
            url='url',
            description='Resource 3',
            type=BasemapLayerType.XYZ_TILE
        )
        self.resource_3.permission.update_user_permission(
            self.creator, PERMISSIONS.LIST
        )
        self.resource_3.permission.update_group_permission(
            self.group, PERMISSIONS.OWNER
        )

        # Add basemap to dashboard
        self.dashboard_1 = Dashboard.objects.create(
            name='Test 1',
            slug='test_1'
        )
        DashboardBasemap.objects.create(
            object=self.resource_1,
            dashboard=self.dashboard_1
        )
        self.dashboard_2 = Dashboard.objects.create(
            name='Test 2',
            slug='test_2'
        )
        DashboardBasemap.objects.create(
            object=self.resource_2,
            dashboard=self.dashboard_2
        )
        DashboardBasemap.objects.create(
            object=self.resource_3,
            dashboard=self.dashboard_2
        )

    def test_list_api_by_permission(self):
        """Test List API."""
        url = reverse('basemaps-list')
        self.assertRequestGetView(url, 403)

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
        url = reverse('basemaps-list') + '?' + params
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
        url = reverse('basemaps-list') + '?' + params
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
        url = reverse('basemaps-list') + '?' + params
        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertEqual(len(response.json()['results']), 2)
        for result in response.json()['results']:
            self.assertTrue(
                result['id'] in [self.resource_1.id, self.resource_2.id])

        params = urllib.parse.urlencode(
            {
                'type__in': BasemapLayerType.WMS
            }
        )
        url = reverse('basemaps-list') + '?' + params
        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertEqual(len(response.json()['results']), 1)
        self.assertEqual(
            response.json()['results'][0]['id'], self.resource_2.id
        )

        params = urllib.parse.urlencode(
            {
                'project_slug__in': 'test_1'
            }
        )
        url = reverse('basemaps-list') + '?' + params
        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertEqual(len(response.json()['results']), 1)
        self.assertEqual(
            response.json()['results'][0]['id'], self.resource_1.id
        )

        params = urllib.parse.urlencode(
            {
                'project_id__in': (
                    f'{self.dashboard_1.id},{self.dashboard_2.id}'
                )
            }
        )
        url = reverse('basemaps-list') + '?' + params
        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertEqual(len(response.json()['results']), 3)

    def test_create_api(self):
        """Test POST API."""
        url = reverse('basemaps-list')
        self.assertRequestPostView(url, 403, data={})
        self.assertRequestPostView(url, 403, user=self.viewer, data={})
        self.assertRequestPostView(
            url, 400,
            user=self.creator,
            data={
                "name": 'New name',
                "url": 'New url',
                "type": 'Type',
                "category": 'Test'
            },
            content_type=self.JSON_CONTENT
        )
        response = self.assertRequestPostView(
            url, 201,
            user=self.creator,
            data={
                "name": 'New name',
                "url": 'New url',
                "type": BasemapLayerType.XYZ_TILE,
                "category": 'Test'
            },
            content_type=self.JSON_CONTENT
        )
        obj = BasemapLayer.objects.get(id=response.json()['id'])
        self.assertEqual(obj.name, 'New name')
        self.assertEqual(response.json()['name'], 'New name')
        self.assertEqual(obj.url, 'New url')
        self.assertEqual(response.json()['url'], 'New url')
        self.assertEqual(obj.type, BasemapLayerType.XYZ_TILE)
        self.assertEqual(response.json()['type'], BasemapLayerType.XYZ_TILE)
        self.assertEqual(obj.category, 'Test')
        self.assertEqual(response.json()['category'], 'Test')
        self.assertEqual(obj.creator, self.creator)
        self.assertEqual(response.json()['created_by'], self.creator.username)

    def test_detail_api(self):
        """Test GET DETAIL API."""
        url = reverse('basemaps-detail', args=[0])
        self.assertRequestGetView(url, 403)
        self.assertRequestGetView(url, 404, user=self.viewer)
        self.assertRequestGetView(url, 404, user=self.creator)
        self.assertRequestGetView(url, 404, user=self.admin)

        url = reverse(
            'basemaps-detail', kwargs={'id': self.resource_3.id}
        )
        self.assertRequestGetView(url, 403)
        self.assertRequestGetView(url, 403, user=self.viewer)
        self.assertRequestGetView(url, 403, user=self.creator)
        response = self.assertRequestGetView(url, 200, user=self.admin)

        self.assertEqual(response.json()['name'], self.resource_3.name)
        self.assertEqual(response.json()['url'], self.resource_3.url)
        self.assertEqual(response.json()['type'], self.resource_3.type)
        self.assertEqual(response.json()['category'], self.resource_3.category)
        self.assertEqual(
            response.json()['created_by'], self.resource_3.creator.username
        )

    def test_update_api(self):
        """Test PUT API."""
        url = reverse('basemaps-detail', args=[0])
        self.assertRequestPutView(url, 403, data={})
        self.assertRequestPutView(url, 403, user=self.viewer, data={})
        self.assertRequestPutView(url, 404, user=self.creator, data={})
        self.assertRequestPutView(url, 404, user=self.admin, data={})

        url = reverse(
            'basemaps-detail', kwargs={'id': self.resource_3.id}
        )
        self.assertRequestPutView(url, 403, data={})
        self.assertRequestPutView(url, 403, user=self.viewer, data={})
        self.assertRequestPutView(url, 403, user=self.creator, data={})
        self.assertRequestPutView(
            url, 400,
            user=self.creator_in_group,
            data={
                "name": self.resource_3.name,
                "url": self.resource_3.url,
                "type": self.resource_3.type
            },
            content_type=self.JSON_CONTENT
        )
        self.assertRequestPutView(
            url, 200,
            user=self.creator_in_group,
            data={
                "name": self.resource_3.name,
                "url": self.resource_3.url,
                "type": self.resource_3.type,
                "category": 'Test'
            },
            content_type=self.JSON_CONTENT
        )
        self.assertEqual(
            BasemapLayer.objects.get(id=self.resource_3.id).name, 'Name C'
        )
        self.assertEqual(
            BasemapLayer.objects.get(id=self.resource_3.id).type,
            BasemapLayerType.XYZ_TILE
        )
        self.assertEqual(
            BasemapLayer.objects.get(id=self.resource_3.id).description,
            ''
        )
        self.assertEqual(
            BasemapLayer.objects.get(id=self.resource_3.id).url, 'url'
        )
        self.assertEqual(
            BasemapLayer.objects.get(id=self.resource_3.id).group.name, 'Test'
        )

    def test_patch_api(self):
        """Test PATCH API."""
        url = reverse('basemaps-detail', args=[0])
        self.assertRequestPatchView(url, 403, data={})
        self.assertRequestPatchView(url, 403, user=self.viewer, data={})
        self.assertRequestPatchView(url, 404, user=self.creator, data={})
        self.assertRequestPatchView(url, 404, user=self.admin, data={})

        url = reverse(
            'basemaps-detail', kwargs={'id': self.resource_3.id}
        )
        self.assertRequestPatchView(url, 403, data={})
        self.assertRequestPatchView(url, 403, user=self.viewer, data={})
        self.assertRequestPatchView(url, 403, user=self.creator, data={})
        self.assertRequestPatchView(
            url, 400,
            user=self.creator_in_group,
            data={
                "name": self.resource_3.name,
                "url": self.resource_3.url,
                "type": self.resource_3.type
            },
            content_type=self.JSON_CONTENT
        )
        self.assertRequestPatchView(
            url, 200,
            user=self.creator_in_group,
            data={
                "name": self.resource_3.name,
                "url": self.resource_3.url,
                "type": self.resource_3.type,
                "category": 'Test'
            },
            content_type=self.JSON_CONTENT
        )
        self.assertEqual(
            BasemapLayer.objects.get(id=self.resource_3.id).name, 'Name C'
        )
        self.assertEqual(
            BasemapLayer.objects.get(id=self.resource_3.id).type,
            BasemapLayerType.XYZ_TILE
        )
        self.assertEqual(
            BasemapLayer.objects.get(id=self.resource_3.id).description,
            'Resource 3'
        )
        self.assertEqual(
            BasemapLayer.objects.get(id=self.resource_3.id).url, 'url'
        )
        self.assertEqual(
            BasemapLayer.objects.get(id=self.resource_3.id).group.name, 'Test'
        )

    def test_delete_api(self):
        """Test DELETE API."""
        id = self.resource_1.id
        self.check_delete_resource_with_different_users(id, 'basemaps-detail')
        self.assertIsNone(BasemapLayer.objects.filter(id=id).first())

        id = self.resource_3.id
        self.check_delete_resource_with_different_users(id, 'basemaps-detail')
        self.assertIsNone(BasemapLayer.objects.filter(id=id).first())
