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
__date__ = '27/05/2026'
__copyright__ = ('Copyright 2026, Unicef')

import json

from cloud_native_gis.models.layer import Layer
from cloud_native_gis.models.layer_upload import LayerUpload
from cloud_native_gis.utils.connection import (
    fields as layer_fields, get_json_features
)
from django.contrib.auth import get_user_model
from django.urls import reverse
from knox.models import AuthToken

from core.models.api_key import ApiKey
from core.settings.utils import ABS_PATH
from geosight.data.models.context_layer import (
    ContextLayer, ContextLayerGroup, LayerType
)
from geosight.permission.models.factory import PERMISSIONS
from geosight.permission.tests._base import BasePermissionTest

User = get_user_model()


class ContextLayerCloudNativeCOGTest(BasePermissionTest.TestCase):
    """Test for context layer cloud native gis."""

    payload = {
        'name': 'name',
        'layer_type': LayerType.CLOUD_NATIVE_GIS_LAYER
    }

    def setUp(self):
        """Setup."""
        super().setUp()
        # Resource layer attribute
        self.resource_1 = self._create_resource(
            user=self.resource_creator,
            name='Name A',
            group='Group 1'
        )
        self.resource_2 = self._create_resource(
            user=self.resource_creator,
            name='Name B',
            group='Group 2',
            description='This is test'
        )
        self.resource_3 = self._create_resource(
            user=self.resource_creator,
            name='Name C',
            group='Group 3',
            description='Resource 3'
        )
        self.resource_3.permission.update_user_permission(
            self.creator, PERMISSIONS.LIST
        )
        self.resource_3.permission.update_group_permission(
            self.group, PERMISSIONS.OWNER
        )
        self.resource_4 = self._create_resource(
            user=self.resource_creator,
            name='Name Public',
            group='Group 4',
            description='This is public'
        )
        self.resource_4.permission.public_permission = PERMISSIONS.READ.name
        self.resource_4.permission.save()

    def create_resource(self, user):
        """Create resource function."""
        return None

    def _create_resource(self, user, name, group, description=None):
        """Create resource function."""
        file_path = ABS_PATH(
            'geosight', 'data', 'tests', 'api', 'context_layer',
            'data', 'somalia.zip'
        )
        resource = ContextLayer.permissions.create(
            user=self.resource_creator,
            name=name,
            group=ContextLayerGroup.objects.create(name=group),
            description=description
        )
        with open(file_path, "rb") as f:
            response = self.assertRequestPostView(
                url=reverse("cloud-native-gis-upload-create"),
                code=200,
                data={"file": f},  # file object here
                user=self.admin
            )
            resource.cloud_native_gis_layer_id = response.json()
            layer = Layer.objects.get(
                id=resource.cloud_native_gis_layer_id
            )
            layer_upload = LayerUpload.objects.filter(layer=layer).first()
            layer_upload.import_data()
            layer.refresh_from_db()
            col_names = [
                f.name for f in layer_fields(
                    layer.schema_name, layer.table_name
                )
            ]
            self.assertIn('id', col_names)
            self.assertTrue(layer.is_ready)
            resource.save()
        return resource

    def test_list_api_by_permission(self):
        """Test List API."""
        url = reverse('ogc:collections')
        ContextLayer.permissions.create(
            user=self.resource_creator,
            name='Non Cloud Native',
            group=ContextLayerGroup.objects.create(name='Group 4')
        )

        response = self.assertRequestGetView(url, 200)
        results = response.json()['collections']
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['title'], 'Name Public')
        self.assertEqual(results[0]['description'], 'This is public')

        response = self.assertRequestGetView(url, 200, user=self.admin)
        results = response.json()['collections']
        self.assertEqual(len(results), 4)
        self.assertEqual(results[0]['title'], 'Name A')
        self.assertEqual(results[0]['description'], None)
        self.assertEqual(results[1]['title'], 'Name B')
        self.assertEqual(results[1]['description'], 'This is test')
        self.assertEqual(results[2]['title'], 'Name C')
        self.assertEqual(results[2]['description'], 'Resource 3')
        self.assertEqual(results[3]['title'], 'Name Public')
        self.assertEqual(results[3]['description'], 'This is public')

        response = self.assertRequestGetView(url, 200, user=self.viewer)
        results = response.json()['collections']
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['title'], 'Name Public')
        self.assertEqual(results[0]['description'], 'This is public')

        response = self.assertRequestGetView(url, 200, user=self.creator)
        results = response.json()['collections']
        self.assertEqual(len(results), 2)
        self.assertEqual(results[0]['title'], 'Name C')
        self.assertEqual(results[0]['description'], 'Resource 3')
        self.assertEqual(results[1]['title'], 'Name Public')
        self.assertEqual(results[1]['description'], 'This is public')

    def test_detail_api(self):
        """Test GET LIST API."""
        url = reverse(
            'ogc:collection-detail',
            kwargs={
                'collection_id': (
                    self.resource_4.cloud_native_gis_layer.unique_id
                )
            }
        )
        response = self.assertRequestGetView(url, 200)
        results = response.json()
        self.assertEqual(results['title'], 'Name Public')
        self.assertEqual(results['description'], 'This is public')

        response = self.assertRequestGetView(url, 200, user=self.admin)
        results = response.json()
        self.assertEqual(results['title'], 'Name Public')
        self.assertEqual(results['description'], 'This is public')

        url = reverse(
            'ogc:collection-detail',
            kwargs={
                'collection_id': (
                    self.resource_3.cloud_native_gis_layer.unique_id
                )
            }
        )
        self.assertRequestGetView(url, 404)
        response = self.assertRequestGetView(url, 200, user=self.admin)
        results = response.json()
        self.assertEqual(results['title'], 'Name C')
        self.assertEqual(results['description'], 'Resource 3')
        self.assertRequestGetView(url, 404, user=self.viewer)
        response = self.assertRequestGetView(url, 200, user=self.creator)
        results = response.json()
        self.assertEqual(results['title'], 'Name C')
        self.assertEqual(results['description'], 'Resource 3')

    def test_items(self):
        """Test ITEMS API."""
        url = reverse(
            'ogc:collection-items',
            kwargs={
                'collection_id': (
                    self.resource_4.cloud_native_gis_layer.unique_id
                )
            }
        )
        response = self.assertRequestGetView(url, 200)
        results = response.json()
        self.assertEqual(results['numberMatched'], 47)
        self.assertEqual(len(results['features']), 47)

        response = self.assertRequestGetView(url, 200, user=self.admin)
        results = response.json()
        self.assertEqual(results['numberMatched'], 47)
        self.assertEqual(len(results['features']), 47)

        url = reverse(
            'ogc:collection-items',
            kwargs={
                'collection_id': (
                    self.resource_3.cloud_native_gis_layer.unique_id
                )
            }
        )
        self.assertRequestGetView(url, 404)
        response = self.assertRequestGetView(url, 200, user=self.admin)
        results = response.json()
        self.assertEqual(results['numberMatched'], 47)
        self.assertEqual(len(results['features']), 47)
        self.assertRequestGetView(url, 404, user=self.viewer)
        response = self.assertRequestGetView(url, 200, user=self.creator)
        results = response.json()
        self.assertEqual(results['numberMatched'], 47)
        self.assertEqual(len(results['features']), 47)

        # Test limit
        url = reverse(
            'ogc:collection-items',
            kwargs={
                'collection_id': (
                    self.resource_3.cloud_native_gis_layer.unique_id
                )
            }
        ) + '?limit=10'
        response = self.assertRequestGetView(url, 200, user=self.admin)
        results = response.json()
        self.assertEqual(results['numberMatched'], 47)
        self.assertEqual(len(results['features']), 10)

        # Test filter
        url = reverse(
            'ogc:collection-items',
            kwargs={
                'collection_id': (
                    self.resource_3.cloud_native_gis_layer.unique_id
                )
            }
        ) + '?filter=amenity=clinic'
        response = self.assertRequestGetView(url, 200, user=self.admin)
        results = response.json()
        self.assertEqual(results['numberMatched'], 13)

    def test_create_feature(self):
        """Test CREATE API."""
        feature = {
            'type': 'Feature',
            'geometry': {'type': 'Point', 'coordinates': [45.3, 2.0]},
            'properties': {'amenity': 'test_create'},
        }
        url = reverse(
            'ogc:collection-items',
            kwargs={
                'collection_id': (
                    self.resource_4.cloud_native_gis_layer.unique_id
                )
            }
        )
        # Public collection is visible but not writable without edit permission.
        response = self.assertRequestPostView(
            url, 400, json.dumps(feature),
            content_type='application/geo+json'
        )
        self.assertEqual(
            response.json()['description'], 'Collection is not editable'
        )
        response = self.assertRequestPostView(
            url, 400, json.dumps(feature), user=self.viewer,
            content_type='application/geo+json'
        )
        self.assertEqual(
            response.json()['description'], 'Collection is not editable'
        )

        # Check last feature
        features = get_json_features(
            schema_name=self.resource_4.cloud_native_gis_layer.schema_name,
            table_name=self.resource_4.cloud_native_gis_layer.table_name
        )
        last_id = features[-1]['id']
        self.assertIsNotNone(last_id)

        # Admin has edit permission → 201 Created.
        self.assertRequestPostView(
            url, 201, json.dumps(feature), user=self.admin,
            content_type='application/geo+json'
        )

        features = get_json_features(
            schema_name=self.resource_4.cloud_native_gis_layer.schema_name,
            table_name=self.resource_4.cloud_native_gis_layer.table_name
        )
        self.assertEqual(features[-1]['id'], (last_id + 1))

        url_private = reverse(
            'ogc:collection-items',
            kwargs={
                'collection_id': (
                    self.resource_3.cloud_native_gis_layer.unique_id
                )
            }
        )
        # Private collection not in anonymous queryset → 404.
        self.assertRequestPostView(
            url_private, 404, json.dumps(feature),
            content_type='application/geo+json'
        )
        # Check last feature
        features = get_json_features(
            schema_name=self.resource_3.cloud_native_gis_layer.schema_name,
            table_name=self.resource_3.cloud_native_gis_layer.table_name
        )
        last_id = features[-1]['id']
        self.assertIsNotNone(last_id)

        # Admin can create in private collection.
        self.assertRequestPostView(
            url_private, 201, json.dumps(feature), user=self.admin,
            content_type='application/geo+json'
        )

        features = get_json_features(
            schema_name=self.resource_3.cloud_native_gis_layer.schema_name,
            table_name=self.resource_3.cloud_native_gis_layer.table_name
        )
        self.assertEqual(features[-1]['id'], (last_id + 1))

    def test_edit_feature(self):
        """Test EDIT (PUT) API."""
        updated_feature = {
            'type': 'Feature',
            'geometry': {'type': 'Point', 'coordinates': [45.3, 2.0]},
            'properties': {'amenity': 'edited'},
        }

        # Resolve an existing item ID from resource_4.
        items_url = reverse(
            'ogc:collection-items',
            kwargs={
                'collection_id': (
                    self.resource_4.cloud_native_gis_layer.unique_id
                )
            }
        )
        response = self.assertRequestGetView(
            items_url, 200, user=self.admin
        )
        item_id = response.json()['features'][0]['id']

        url = reverse(
            'ogc:collection-item',
            kwargs={
                'collection_id': (
                    self.resource_4.cloud_native_gis_layer.unique_id
                ),
                'item_id': item_id,
            }
        )
        updated_feature_with_id = {
            'type': 'Feature',
            'id': item_id,
            'geometry': {'type': 'Point', 'coordinates': [45.3, 2.0]},
            'properties': {'amenity': 'edited'},
        }

        # Public collection: accessible but not editable without write perm.
        response = self.assertRequestPutView(
            url, 400, json.dumps(updated_feature),
            content_type='application/geo+json'
        )
        self.assertEqual(
            response.json()['description'], 'Collection is not editable'
        )
        response = self.assertRequestPutView(
            url, 400, json.dumps(updated_feature), user=self.viewer,
            content_type='application/geo+json'
        )
        self.assertEqual(
            response.json()['description'], 'Collection is not editable'
        )
        # Admin PUT without id → 500.
        self.assertRequestPutView(
            url, 500, json.dumps(updated_feature), user=self.admin,
            content_type='application/geo+json'
        )
        # Admin PUT with id → 204.
        self.assertRequestPutView(
            url, 204, json.dumps(updated_feature_with_id), user=self.admin,
            content_type='application/geo+json'
        )
        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertEqual(
            response.json()['properties']['amenity'], 'edited'
        )

        # Resolve an item ID from resource_3 (private).
        private_items_url = reverse(
            'ogc:collection-items',
            kwargs={
                'collection_id': (
                    self.resource_3.cloud_native_gis_layer.unique_id
                )
            }
        )
        response = self.assertRequestGetView(
            private_items_url, 200, user=self.admin
        )
        private_item_id = response.json()['features'][0]['id']

        private_url = reverse(
            'ogc:collection-item',
            kwargs={
                'collection_id': (
                    self.resource_3.cloud_native_gis_layer.unique_id
                ),
                'item_id': private_item_id,
            }
        )
        private_updated_feature_with_id = {
            'type': 'Feature',
            'id': private_item_id,
            'geometry': {'type': 'Point', 'coordinates': [45.3, 2.0]},
            'properties': {'amenity': 'edited'},
        }
        # Private collection not in anonymous queryset → 404.
        self.assertRequestPutView(
            private_url, 404, json.dumps(updated_feature),
            content_type='application/geo+json'
        )
        # Admin PUT without id → 500.
        self.assertRequestPutView(
            private_url, 500, json.dumps(updated_feature),
            user=self.admin,
            content_type='application/geo+json'
        )
        # Admin PUT with id → 204.
        self.assertRequestPutView(
            private_url, 204, json.dumps(private_updated_feature_with_id),
            user=self.admin,
            content_type='application/geo+json'
        )
        response = self.assertRequestGetView(
            private_url, 200, user=self.admin
        )
        self.assertEqual(
            response.json()['properties']['amenity'], 'edited'
        )

    def test_delete_feature(self):
        """Test DELETE API."""
        # Resolve an existing item ID from resource_4.
        items_url = reverse(
            'ogc:collection-items',
            kwargs={
                'collection_id': (
                    self.resource_4.cloud_native_gis_layer.unique_id
                )
            }
        )
        response = self.assertRequestGetView(items_url, 200, user=self.admin)
        item_id = response.json()['features'][0]['id']

        url = reverse(
            'ogc:collection-item',
            kwargs={
                'collection_id': (
                    self.resource_4.cloud_native_gis_layer.unique_id
                ),
                'item_id': item_id,
            }
        )
        # Public collection: accessible but not deletable without edit perm.
        response = self.assertRequestDeleteView(url, 400)
        self.assertEqual(
            response.json()['description'], 'Collection is not editable'
        )
        response = self.assertRequestDeleteView(url, 400, user=self.viewer)
        self.assertEqual(
            response.json()['description'], 'Collection is not editable'
        )
        # Admin can delete → 200 OK.
        self.assertRequestDeleteView(url, 200, user=self.admin)
        # Item is gone.
        self.assertRequestGetView(url, 404, user=self.admin)

        # Private collection: anonymous/viewer cannot see it → 404.
        private_items_url = reverse(
            'ogc:collection-items',
            kwargs={
                'collection_id': (
                    self.resource_3.cloud_native_gis_layer.unique_id
                )
            }
        )
        response = self.assertRequestGetView(
            private_items_url, 200, user=self.admin
        )
        private_item_id = response.json()['features'][0]['id']

        private_url = reverse(
            'ogc:collection-item',
            kwargs={
                'collection_id': (
                    self.resource_3.cloud_native_gis_layer.unique_id
                ),
                'item_id': private_item_id,
            }
        )
        self.assertRequestDeleteView(private_url, 404)
        self.assertRequestDeleteView(private_url, 200, user=self.admin)

    def _create_api_key(self, user):
        """Create an active Knox token + ApiKey for *user*.

        Returns the plain-text token string to use in Authorization headers.
        """
        auth_token, token_str = AuthToken.objects.create(user=user)
        ApiKey.objects.create(token=auth_token)
        return token_str

    def test_bearer_authentication(self):
        """Test that BearerAuthentication grants the correct access."""
        url = reverse('ogc:collections')

        # No token: anonymous (only public resource visible)
        client = self.test_client()
        response = client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()['collections']), 1)

        # Invalid token: 401
        client = self.test_client()
        response = client.get(
            url,
            HTTP_AUTHORIZATION='Bearer invalidtoken123',
            HTTP_GEOSIGHT_USER_KEY=self.admin.email,
        )
        self.assertEqual(response.status_code, 401)

        # Valid token but missing GeoSight-User-Key: 401
        admin_token = self._create_api_key(self.admin)
        client = self.test_client()
        response = client.get(
            url, HTTP_AUTHORIZATION=f'Bearer {admin_token}'
        )
        self.assertEqual(response.status_code, 401)

        # Valid token but wrong GeoSight-User-Key: 401
        client = self.test_client()
        response = client.get(
            url,
            HTTP_AUTHORIZATION=f'Bearer {admin_token}',
            HTTP_GEOSIGHT_USER_KEY='wrong@example.com',
        )
        self.assertEqual(response.status_code, 401)

        # Inactive token: 401
        auth_token, token_str = AuthToken.objects.create(user=self.admin)
        api_key = ApiKey.objects.create(token=auth_token, is_active=False)
        client = self.test_client()
        response = client.get(
            url,
            HTTP_AUTHORIZATION=f'Bearer {token_str}',
            HTTP_GEOSIGHT_USER_KEY=self.admin.email,
        )
        self.assertEqual(response.status_code, 401)
        api_key.delete()

        # Valid admin token + correct key: all 4 collections
        client = self.test_client()
        response = client.get(
            url,
            HTTP_AUTHORIZATION=f'Bearer {admin_token}',
            HTTP_GEOSIGHT_USER_KEY=self.admin.email,
        )
        self.assertEqual(response.status_code, 200)
        results = response.json()['collections']
        self.assertEqual(len(results), 4)

        # Valid viewer token + correct key: only public collection
        viewer_token = self._create_api_key(self.viewer)
        client = self.test_client()
        response = client.get(
            url,
            HTTP_AUTHORIZATION=f'Bearer {viewer_token}',
            HTTP_GEOSIGHT_USER_KEY=self.viewer.email,
        )
        self.assertEqual(response.status_code, 200)
        results = response.json()['collections']
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['title'], 'Name Public')

        # Valid creator token + correct key: resource_3 + public
        creator_token = self._create_api_key(self.creator)
        client = self.test_client()
        response = client.get(
            url,
            HTTP_AUTHORIZATION=f'Bearer {creator_token}',
            HTTP_GEOSIGHT_USER_KEY=self.creator.email,
        )
        self.assertEqual(response.status_code, 200)
        results = response.json()['collections']
        self.assertEqual(len(results), 2)
        self.assertEqual(results[0]['title'], 'Name C')
        self.assertEqual(results[1]['title'], 'Name Public')

        # Token keyword is case-insensitive (Token vs Bearer)
        client = self.test_client()
        response = client.get(
            url,
            HTTP_AUTHORIZATION=f'Token {admin_token}',
            HTTP_GEOSIGHT_USER_KEY=self.admin.email,
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()['collections']), 4)

    def test_collection_schema(self):
        """Test SCHEMA API."""
        url = reverse(
            'ogc:collection-schema',
            kwargs={
                'collection_id': (
                    self.resource_4.cloud_native_gis_layer.unique_id
                )
            }
        )

        # Public collection: anyone can retrieve the schema.
        response = self.assertRequestGetView(url, 200)
        self.assertIn('properties', response.json())

        response = self.assertRequestGetView(url, 200, user=self.viewer)
        self.assertIn('properties', response.json())

        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertIn('properties', response.json())

        url_private = reverse(
            'ogc:collection-schema',
            kwargs={
                'collection_id': (
                    self.resource_3.cloud_native_gis_layer.unique_id
                )
            }
        )
        # Private collection: anonymous and viewer are denied.
        self.assertRequestGetView(url_private, 404)
        self.assertRequestGetView(url_private, 404, user=self.viewer)
        # Creator has LIST permission on resource_3 → can read schema.
        response = self.assertRequestGetView(
            url_private, 200, user=self.creator
        )
        self.assertIn('properties', response.json())
        # Admin can always read.
        response = self.assertRequestGetView(
            url_private, 200, user=self.admin
        )
        self.assertIn('properties', response.json())
