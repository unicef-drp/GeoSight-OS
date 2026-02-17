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
__date__ = '13/10/2025'
__copyright__ = ('Copyright 2025, Unicef')

import copy
import json

from cloud_native_gis.models.layer import Layer
from django.contrib.auth import get_user_model
from django.urls import reverse

from geosight.data.models.context_layer import ContextLayer, LayerType
from geosight.permission.tests._base import BasePermissionTest

User = get_user_model()


class ContextLayerCloudNativeAPIFlowTest(BasePermissionTest.TestCase):
    """Test for context layer cloud native gis.

    We will try to create a flow for creating cloud native gis layer.
    1. Create layer through API
    2. Upload data using geojson
    """

    payload = {}

    def setUp(self):
        """Setup."""
        super().setUp()
        self.client.force_login(self.admin)

    def create_resource(self, user):
        """Create resource function."""
        payload = copy.deepcopy(self.payload)
        return ContextLayer.permissions.create(
            name='name',
            user=user,
            **payload
        )

    def test_api_flow(self):
        """Test attributes."""
        self.cloud_native_layer = Layer.objects.create(
            created_by=self.creator
        )
        # ----------------------------------------
        # CREATE LAYER
        # ----------------------------------------
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
            }
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
        self.assertRequestPostView(
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
        response = self.assertRequestPostView(
            url, 201,
            user=self.creator,
            data={
                "name": 'New name',
                "layer_type": LayerType.CLOUD_NATIVE_GIS_LAYER,
                "cloud_native_gis_layer_id": self.cloud_native_layer.pk,
                "category": 'Test',
                "styles": styles
            },
            content_type=self.JSON_CONTENT
        )
        obj = ContextLayer.objects.get(id=response.json()['id'])

        # Now we update using the API
        # But no cloud_native_gis_layer_id
        patch_data = response.json()
        patch_url = reverse('context-layers-detail', args=(obj.id,))
        patch_data['cloud_native_gis_layer_id'] = None
        patch_response = self.assertRequestPutView(
            patch_url, 400,
            user=self.creator,
            data=patch_data,
            content_type=self.JSON_CONTENT
        )
        self.assertEqual(
            patch_response.json()['cloud_native_gis_layer_id'],
            ['This field is required.']
        )

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

        # Update geojson
        context_layer = obj

        # Just able to replace
        self.assertRequestPostView(
            url=reverse(
                "context_layers_data-replace",
                kwargs={'context_layer_id': context_layer.id}
            ),
            code=204,
            user=self.admin,
            data={
                "type": "FeatureCollection",
                "features": [
                    {
                        "type": "Feature",
                        "properties": {
                            "name": "New clinic",
                            "amenity": "clinic"
                        },
                        "geometry": {
                            "type": "Point",
                            "coordinates": [0, 0]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "name": "New clinic 2",
                            "amenity": "clinic"
                        },
                        "geometry": {
                            "type": "Point",
                            "coordinates": [0, 1]
                        }
                    }
                ]
            },
            content_type=self.JSON_CONTENT
        )
        response = self.assertRequestGetView(
            url=reverse(
                "context_layers_data-features",
                kwargs={'context_layer_id': context_layer.id}
            ),
            code=200,
            user=self.admin
        )
        self.assertEqual(response.json()["count"], 2)
        response = self.assertRequestGetView(
            url=reverse(
                "context_layers_attributes-list",
                kwargs={'context_layer_id': context_layer.id}
            ),
            code=200,
            user=self.admin
        )
        self.assertEqual(response.json()["count"], 2)
        self.assertEqual(
            response.json()["results"][0]["attribute_name"], "name"
        )
        self.assertEqual(
            response.json()["results"][1]["attribute_name"], "amenity"
        )
