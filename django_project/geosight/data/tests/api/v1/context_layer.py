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

import json
import urllib.parse

from django.contrib.auth import get_user_model
from django.urls import reverse

from geosight.data.models.context_layer import (
    ContextLayer, ContextLayerGroup, LayerType
)
from geosight.permission.models.factory import PERMISSIONS
from geosight.permission.tests._base import BasePermissionTest

User = get_user_model()


class ContextLayerPermissionTest(BasePermissionTest.TestCase):
    """Test for ContextLayer API."""

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
        self.resource_1 = ContextLayer.permissions.create(
            user=self.resource_creator,
            name='Name A',
            group=ContextLayerGroup.objects.create(name='Group 1')
        )
        self.resource_2 = ContextLayer.permissions.create(
            user=self.resource_creator,
            name='Name B',
            group=ContextLayerGroup.objects.create(name='Group 2'),
            description='This is test'
        )
        self.resource_3 = ContextLayer.permissions.create(
            user=self.resource_creator,
            name='Name C',
            group=ContextLayerGroup.objects.create(name='Group 3'),
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
        url = reverse('context-layers-list')
        resource = ContextLayer.permissions.create(
            user=self.resource_creator,
            name='Name Public',
            group=ContextLayerGroup.objects.create(name='Group 4')
        )
        resource.permission.public_permission = PERMISSIONS.READ.name
        resource.permission.save()
        response = self.assertRequestGetView(url, 200)
        self.assertEqual(len(response.json()['results']), 1)
        self.assertFalse("modified_by" in response.json()['results'][0].keys())
        self.assertFalse("created_by" in response.json()['results'][0].keys())

        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertEqual(len(response.json()['results']), 4)
        self.assertTrue("modified_by" in response.json()['results'][0].keys())
        self.assertTrue("created_by" in response.json()['results'][0].keys())

        response = self.assertRequestGetView(url, 200, user=self.viewer)
        self.assertEqual(len(response.json()['results']), 1)
        self.assertTrue("modified_by" in response.json()['results'][0].keys())
        self.assertTrue("created_by" in response.json()['results'][0].keys())

        response = self.assertRequestGetView(url, 200, user=self.creator)
        self.assertEqual(len(response.json()['results']), 2)
        self.assertTrue("modified_by" in response.json()['results'][0].keys())
        self.assertTrue("created_by" in response.json()['results'][0].keys())

    def test_list_api_by_filter(self):
        """Test GET LIST API."""
        params = urllib.parse.urlencode(
            {
                'name__contains': 'ame C'
            }
        )
        url = reverse('context-layers-list') + '?' + params
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
        url = reverse('context-layers-list') + '?' + params
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
        url = reverse('context-layers-list') + '?' + params
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
        url = reverse('context-layers-list') + '?' + params
        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertEqual(len(response.json()['results']), 1)
        for result in response.json()['results']:
            self.assertTrue(
                result['id'] in [self.resource_3.id])

        # Search
        params = urllib.parse.urlencode(
            {
                'q': 'Resource '
            }
        )
        url = reverse('context-layers-list') + '?' + params
        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertEqual(len(response.json()['results']), 1)
        self.assertEqual(response.json()['results'][0]['name'], 'Name C')

    def test_list_api_sort(self):
        """Test GET LIST API."""
        params = urllib.parse.urlencode(
            {
                'sort': 'name'
            }
        )
        url = reverse('context-layers-list') + '?' + params
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
        url = reverse('context-layers-list') + '?' + params
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

    def test_list_api_extra_field(self):
        """Test GET LIST API."""
        # Test the all fields
        url = reverse('context-layers-list') + '?fields=__all__'
        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertEqual(len(response.json()['results']), 3)
        for result in response.json()['results']:
            self.assertIsNotNone(result['permission'])
            result['styles']  # noqa

        # Test the extra fields
        url = reverse('context-layers-list') + '?extra_fields=permission'
        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertEqual(len(response.json()['results']), 3)
        for result in response.json()['results']:
            self.assertIsNotNone(result['permission'])
            with self.assertRaises(KeyError):
                result['styles']  # noqa

        # Test the extra fields
        url = reverse('context-layers-list') + '?fields=styles,permission'
        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertEqual(len(response.json()['results']), 3)
        for result in response.json()['results']:
            self.assertIsNotNone(result['permission'])
            result['styles']  # noqa
            with self.assertRaises(KeyError):
                result['name']  # noqa

    def test_create_api(self):
        """Test POST API."""
        url = reverse('context-layers-list') + '?fields=__all__'
        self.assertRequestPostView(url, 403, data={})
        self.assertRequestPostView(url, 403, user=self.viewer, data={})
        self.assertRequestPostView(
            url, 400,
            user=self.creator,
            data={
                "name": 'New name',
                "url": 'New url',
                "layer_type": 'Type',
                "category": 'Test'
            },
            content_type=self.JSON_CONTENT
        )
        styles = [
            {
                "id": "1",
                "type": "circle",
                "paint": {
                    "circle-color": "#98F194",
                    "circle-radius": 6,
                    "circle-opacity": 1,
                    "circle-stroke-width": 1
                },
                "source": "00000000-0000-0000-0000-000000000000",
                "source-layer": "default"
            },
            {
                "id": "2",
                "type": "circle",
                "paint": {
                    "circle-color": "#88005C",
                    "circle-radius": 6,
                    "circle-opacity": 1,
                    "circle-stroke-width": 1
                },
                "source": "00000000-0000-0000-0000-000000000000",
                "source-layer": "default"
            },

        ]
        self.assertRequestPostView(
            url, 400,
            user=self.creator,
            data={
                "name": 'New name',
                "layer": LayerType.CLOUD_NATIVE_GIS_LAYER,
                "category": 'Test',
                "styles": styles
            },
            content_type=self.JSON_CONTENT
        )
        response = self.assertRequestPostView(
            url, 201,
            user=self.creator,
            data={
                "name": 'New name',
                "layer_type": LayerType.CLOUD_NATIVE_GIS_LAYER,
                "category": 'Test',
                "styles": styles
            },
            content_type=self.JSON_CONTENT
        )
        obj = ContextLayer.objects.get(id=response.json()['id'])
        self.assertEqual(obj.name, 'New name')
        self.assertEqual(response.json()['name'], 'New name')
        self.assertEqual(obj.layer_type, LayerType.CLOUD_NATIVE_GIS_LAYER)
        self.assertEqual(
            response.json()['layer_type'], LayerType.CLOUD_NATIVE_GIS_LAYER
        )
        self.assertEqual(obj.group.name, 'Test')
        self.assertEqual(response.json()['category'], 'Test')
        self.assertEqual(obj.styles, json.dumps(styles))
        self.assertEqual(response.json()['styles'], styles)
        self.assertEqual(obj.creator, self.creator)
        self.assertEqual(response.json()['created_by'], self.creator.username)

    def test_detail_api(self):
        """Test GET DETAIL API."""
        url = reverse('context-layers-detail', args=[self.resource_1.id])
        self.assertRequestGetView(url, 403)
        self.assertRequestGetView(url, 403, user=self.viewer)
        self.assertRequestGetView(url, 403, user=self.creator)
        self.assertRequestGetView(url, 200, user=self.resource_creator)
        self.assertRequestGetView(url, 200, user=self.admin)

        url = reverse(
            'context-layers-detail', kwargs={'id': self.resource_3.id}
        )
        self.assertRequestGetView(url, 403)
        self.assertRequestGetView(url, 403, user=self.viewer)
        self.assertRequestGetView(url, 403, user=self.creator)
        response = self.assertRequestGetView(url, 200, user=self.admin)

        self.assertEqual(response.json()['name'], self.resource_3.name)
        self.assertEqual(
            response.json()['created_by'], self.resource_3.creator.username
        )

    def test_update_api(self):
        """Test PUT API."""
        url = reverse('context-layers-detail', args=[0])
        self.assertRequestPutView(url, 403, data={})
        self.assertRequestPutView(url, 403, user=self.viewer, data={})
        self.assertRequestPutView(url, 404, user=self.creator, data={})
        self.assertRequestPutView(url, 404, user=self.admin, data={})

        url = reverse(
            'context-layers-detail', kwargs={'id': self.resource_3.id}
        )
        self.assertRequestPutView(url, 403, data={})
        self.assertRequestPutView(url, 403, user=self.viewer, data={})
        self.assertRequestPutView(url, 403, user=self.creator, data={})
        self.assertRequestPutView(
            url, 400,
            user=self.creator_in_group,
            data={
                "name": self.resource_3.name,
                "layer_type": LayerType.RELATED_TABLE,
            },
            content_type=self.JSON_CONTENT
        )
        self.assertRequestPutView(
            url, 200,
            user=self.creator_in_group,
            data={
                "name": self.resource_3.name,
                "layer_type": LayerType.RELATED_TABLE,
                "category": 'Test'
            },
            content_type=self.JSON_CONTENT
        )
        self.assertEqual(
            ContextLayer.objects.get(id=self.resource_3.id).name, 'Name C'
        )
        self.assertEqual(
            ContextLayer.objects.get(id=self.resource_3.id).layer_type,
            LayerType.RELATED_TABLE
        )
        self.assertEqual(
            ContextLayer.objects.get(id=self.resource_3.id).description,
            ''
        )
        self.assertEqual(
            ContextLayer.objects.get(id=self.resource_3.id).group.name, 'Test'
        )

    def test_patch_api(self):
        """Test PATCH API."""
        url = reverse('context-layers-detail', args=[0])
        self.assertRequestPatchView(url, 403, data={})
        self.assertRequestPatchView(url, 403, user=self.viewer, data={})
        self.assertRequestPatchView(url, 404, user=self.creator, data={})
        self.assertRequestPatchView(url, 404, user=self.admin, data={})

        url = reverse(
            'context-layers-detail', kwargs={'id': self.resource_3.id}
        )
        self.assertRequestPatchView(url, 403, data={})
        self.assertRequestPatchView(url, 403, user=self.viewer, data={})
        self.assertRequestPatchView(url, 403, user=self.creator, data={})
        self.assertRequestPatchView(
            url, 200,
            user=self.creator_in_group,
            data={
                "description": "New description"
            },
            content_type=self.JSON_CONTENT
        )
        self.assertEqual(
            ContextLayer.objects.get(id=self.resource_3.id).name, 'Name C'
        )
        self.assertEqual(
            ContextLayer.objects.get(id=self.resource_3.id).layer_type,
            LayerType.ARCGIS
        )
        self.assertEqual(
            ContextLayer.objects.get(id=self.resource_3.id).description,
            'New description'
        )
        self.assertEqual(
            ContextLayer.objects.get(id=self.resource_3.id).group.name,
            'Group 3'
        )

    def test_destroy_api(self):
        """Test DESTROY API."""
        id = self.resource_1.id
        self.check_delete_resource_with_different_users(
            id, 'context-layers-detail')
        self.assertIsNone(ContextLayer.objects.filter(id=id).first())

        id = self.resource_3.id
        self.check_delete_resource_with_different_users(
            id, 'context-layers-detail'
        )
        self.assertIsNone(ContextLayer.objects.filter(id=id).first())

    def test_delete_api(self):
        """Test DELETE API."""
        resource_1 = ContextLayer.permissions.create(
            user=self.resource_creator,
            name='Name A',
            group=ContextLayerGroup.objects.create(name='Group 1')
        )
        resource_2 = ContextLayer.permissions.create(
            user=self.resource_creator,
            name='Name B',
            group=ContextLayerGroup.objects.create(name='Group 2'),
            description='This is test'
        )
        resource_3 = ContextLayer.permissions.create(
            user=self.resource_creator,
            name='Name C',
            group=ContextLayerGroup.objects.create(name='Group 3'),
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
        url = reverse('context-layers-list') + '?' + params
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
