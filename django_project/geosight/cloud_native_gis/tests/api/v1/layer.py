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
__date__ = '06/06/2024'
__copyright__ = ('Copyright 2023, Unicef')

import urllib.parse

from cloud_native_gis.models.layer import LayerType
from django.contrib.auth import get_user_model
from django.test.testcases import TestCase
from django.urls import reverse

from geosight.cloud_native_gis.models import CloudNativeGISLayer
from geosight.permission.models.factory import PERMISSIONS
from geosight.permission.tests._base import BasePermissionTest

User = get_user_model()


class CloudNativeGISLayerApiTest(BasePermissionTest, TestCase):
    """Test for CloudNativeGISLayer API."""

    def create_resource(self, user):
        """Create resource function."""
        return None

    def create_layer(self, user, name, layer_type, description=None):
        """Create resource function."""
        obj = CloudNativeGISLayer.permissions.create(
            user=self.resource_creator,
            name=name,
            layer_type=layer_type,
            description=description
        )
        obj.permission.public_permission = PERMISSIONS.LIST.name
        obj.permission.save()
        return obj

    def get_resources(self, user):
        """Create resource function."""
        return None

    def setUp(self):
        """To setup test."""
        super().setUp()

        # Resource layer attribute
        self.resource_1 = self.create_layer(
            user=self.resource_creator,
            name='Name A',
            layer_type=LayerType.VECTOR_TILE
        )
        self.resource_2 = self.create_layer(
            user=self.resource_creator,
            name='Name B',
            description='This is test',
            layer_type=LayerType.VECTOR_TILE
        )
        self.resource_3 = self.create_layer(
            user=self.resource_creator,
            name='Name C',
            description='Resource 3',
            layer_type=LayerType.RASTER_TILE
        )
        self.resource_3.permission.update_user_permission(
            self.creator, PERMISSIONS.LIST
        )
        self.resource_3.permission.update_group_permission(
            self.group, PERMISSIONS.OWNER
        )

    def test_list_api_by_permission(self):
        """Test List API."""
        url = reverse('cloud-native-gis-layer-list')
        self.assertRequestGetView(url, 403)

        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertEqual(len(response.json()['results']), 3)

        response = self.assertRequestGetView(url, 200, user=self.viewer)
        self.assertEqual(len(response.json()['results']), 3)

        response = self.assertRequestGetView(url, 200, user=self.creator)
        self.assertEqual(len(response.json()['results']), 3)

        response = self.assertRequestGetView(
            url, 200, user=self.creator_in_group
        )
        self.assertEqual(len(response.json()['results']), 3)

    def test_list_api_by_filter(self):
        """Test GET LIST API."""
        params = urllib.parse.urlencode(
            {
                'name__contains': 'ame C'
            }
        )
        url = reverse('cloud-native-gis-layer-list') + '?' + params
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
        url = reverse('cloud-native-gis-layer-list') + '?' + params
        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertEqual(len(response.json()['results']), 1)
        self.assertEqual(
            response.json()['results'][0]['id'], self.resource_2.id
        )

        params = urllib.parse.urlencode(
            {
                'layer_type__in': LayerType.VECTOR_TILE
            }
        )
        url = reverse('cloud-native-gis-layer-list') + '?' + params
        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertEqual(len(response.json()['results']), 2)
        for resource in response.json()['results']:
            self.assertTrue(
                resource['id'] in [self.resource_2.id, self.resource_1.id]
            )

    def test_create_api(self):
        """Test POST API."""
        url = reverse('cloud-native-gis-layer-list')
        self.assertRequestPostView(url, 403, data={})
        self.assertRequestPostView(url, 403, user=self.viewer, data={})
        response = self.assertRequestPostView(
            url, 201,
            user=self.creator,
            data={
                "name": 'New name',
                "layer_type": LayerType.VECTOR_TILE
            },
            content_type=self.JSON_CONTENT
        )
        obj = CloudNativeGISLayer.objects.get(id=response.json()['id'])
        self.assertEqual(obj.name, 'New name')
        self.assertEqual(response.json()['name'], 'New name')
        self.assertEqual(obj.creator, self.creator)
        self.assertEqual(response.json()['created_by'], self.creator.username)
        self.assertEqual(obj.layer_type, LayerType.VECTOR_TILE)
        self.assertEqual(response.json()['layer_type'], LayerType.VECTOR_TILE)

    def test_detail_api(self):
        """Test GET DETAIL API."""
        url = reverse('cloud-native-gis-layer-detail', args=[0])
        self.assertRequestGetView(url, 403)
        self.assertRequestGetView(url, 404, user=self.viewer)
        self.assertRequestGetView(url, 404, user=self.creator)
        self.assertRequestGetView(url, 404, user=self.admin)

        url = reverse(
            'cloud-native-gis-layer-detail',
            kwargs={'id': self.resource_3.id}
        )
        self.assertRequestGetView(url, 403)
        self.assertRequestGetView(url, 200, user=self.viewer)
        self.assertRequestGetView(url, 200, user=self.creator)
        response = self.assertRequestGetView(url, 200, user=self.admin)

        self.assertEqual(response.json()['name'], self.resource_3.name)
        self.assertEqual(response.json()['layer_type'], self.resource_3.layer_type)
        self.assertEqual(
            response.json()['created_by'], self.resource_3.creator.username
        )

    def test_update_api(self):
        """Test PUT API."""
        url = reverse('cloud-native-gis-layer-detail', args=[0])
        self.assertRequestPutView(url, 403, data={})
        self.assertRequestPutView(url, 403, user=self.viewer, data={})
        self.assertRequestPutView(url, 404, user=self.creator, data={})
        self.assertRequestPutView(url, 404, user=self.admin, data={})

        url = reverse(
            'cloud-native-gis-layer-detail',
            kwargs={'id': self.resource_3.id}
        )
        self.assertRequestPutView(url, 403, data={})
        self.assertRequestPutView(url, 403, user=self.viewer, data={})
        self.assertRequestPutView(url, 403, user=self.creator, data={})
        self.assertRequestPutView(
            url, 200,
            user=self.creator_in_group,
            data={
                "name": self.resource_3.name,
                "layer_type": self.resource_3.layer_type,
                "category": 'Test'
            },
            content_type=self.JSON_CONTENT
        )
        self.assertEqual(
            CloudNativeGISLayer.objects.get(id=self.resource_3.id).name,
            'Name C'
        )

    def test_patch_api(self):
        """Test PATCH API."""
        url = reverse('cloud-native-gis-layer-detail', args=[0])
        self.assertRequestPatchView(url, 403, data={})
        self.assertRequestPatchView(url, 403, user=self.viewer, data={})
        self.assertRequestPatchView(url, 404, user=self.creator, data={})
        self.assertRequestPatchView(url, 404, user=self.admin, data={})

        url = reverse(
            'cloud-native-gis-layer-detail',
            kwargs={'id': self.resource_3.id}
        )
        self.assertRequestPatchView(url, 403, data={})
        self.assertRequestPatchView(url, 403, user=self.viewer, data={})
        self.assertRequestPatchView(url, 403, user=self.creator, data={})
        self.assertRequestPatchView(
            url, 200,
            user=self.creator_in_group,
            data={
                "name": self.resource_3.name,
                "layer_type": self.resource_3.layer_type
            },
            content_type=self.JSON_CONTENT
        )
        self.assertEqual(
            CloudNativeGISLayer.objects.get(id=self.resource_3.id).name,
            'Name C'
        )
        self.assertEqual(
            CloudNativeGISLayer.objects.get(id=self.resource_3.id).layer_type,
            LayerType.RASTER_TILE
        )

    def test_delete_api(self):
        """Test DELETE API."""
        id = self.resource_1.id
        self.check_delete_resource_with_different_users(
            id, 'cloud-native-gis-layer-detail'
        )
        self.assertIsNone(CloudNativeGISLayer.objects.filter(id=id).first())

        id = self.resource_3.id
        self.check_delete_resource_with_different_users(
            id, 'cloud-native-gis-layer-detail'
        )
        self.assertIsNone(CloudNativeGISLayer.objects.filter(id=id).first())
