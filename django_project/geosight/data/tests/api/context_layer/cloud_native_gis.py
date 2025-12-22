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
from cloud_native_gis.models.layer import Layer
from cloud_native_gis.models.layer_upload import LayerUpload
from django.contrib.auth import get_user_model
from django.urls import reverse

from core.settings.utils import ABS_PATH
from geosight.data.models.context_layer import ContextLayer, LayerType
from geosight.permission.tests._base import BasePermissionTest

User = get_user_model()


class ContextLayerCloudNativeTest(BasePermissionTest.TestCase):
    """Test for context layer cloud native gis."""

    payload = {
        'name': 'name',
        'layer_type': LayerType.CLOUD_NATIVE_GIS_LAYER
    }

    def setUp(self):
        """Setup."""
        super().setUp()
        self.client.force_login(self.admin)
        file_path = ABS_PATH(
            'geosight', 'data', 'tests', 'api', 'context_layer',
            'data', 'somalia.zip'
        )
        with open(file_path, "rb") as f:
            response = self.assertRequestPostView(
                url=reverse("cloud-native-gis-upload-create"),
                code=200,
                data={"file": f},  # file object here
                user=self.admin
            )
            self.resource.cloud_native_gis_layer_id = response.json()
            layer = Layer.objects.get(
                id=self.resource.cloud_native_gis_layer_id
            )
            layer_upload = LayerUpload.objects.filter(layer=layer).first()
            layer_upload.import_data()
            layer.refresh_from_db()
            self.assertTrue(layer.is_ready)
            self.resource.save()

    def create_resource(self, user):
        """Create resource function."""
        payload = copy.deepcopy(self.payload)
        return ContextLayer.permissions.create(
            user=user,
            cloud_native_gis_layer_id=Layer.objects.create(created_by=user).pk,
            **payload
        )

    def test_attributes(self):
        """Test attributes."""
        key = "context_layers_attributes-list"
        resource_1 = ContextLayer.permissions.create(
            user=self.admin,
            name='name 2',
            layer_type=LayerType.GEOJSON,
        )
        self.assertRequestGetView(
            url=reverse(
                key, kwargs={'context_layer_id': resource_1.id}
            ),
            code=403,
            user=self.viewer
        )
        self.assertRequestGetView(
            url=reverse(
                key, kwargs={'context_layer_id': resource_1.id}
            ),
            code=400,
            user=self.admin
        )
        response = self.assertRequestGetView(
            url=reverse(
                key, kwargs={'context_layer_id': self.resource.id}
            ),
            code=200,
            user=self.admin
        )
        self.assertEqual(response.json()["count"], 33)

    def test_data(self):
        """Test data."""
        key = "context_layers_data-features"
        resource_1 = ContextLayer.permissions.create(
            user=self.admin,
            name='name 2',
            layer_type=LayerType.GEOJSON,
        )
        self.assertRequestGetView(
            url=reverse(
                key, kwargs={'context_layer_id': resource_1.id}
            ),
            code=403,
            user=self.viewer
        )
        self.assertRequestGetView(
            url=reverse(
                key, kwargs={'context_layer_id': resource_1.id}
            ),
            code=400,
            user=self.admin
        )
        response = self.assertRequestGetView(
            url=reverse(
                key, kwargs={'context_layer_id': self.resource.id}
            ),
            code=200,
            user=self.admin
        )
        self.assertEqual(response.json()["count"], 47)

        # With the filter
        response = self.assertRequestGetView(
            url=reverse(
                key, kwargs={'context_layer_id': self.resource.id}
            ) + "?amenity=clinic",
            code=200,
            user=self.admin
        )
        self.assertEqual(response.json()["count"], 13)

        # With the incorrect filter
        self.assertRequestGetView(
            url=reverse(
                key, kwargs={'context_layer_id': self.resource.id}
            ) + "?non_field=clinic",
            code=400,
            user=self.admin
        )

        # -------------------------------------
        # Delete
        # -------------------------------------
        self.assertRequestDeleteView(
            url=reverse(
                key, kwargs={'context_layer_id': self.resource.id}
            ) + "?amenity=clinic",
            code=403,
            user=self.viewer
        )
        self.assertRequestDeleteView(
            url=reverse(
                key, kwargs={'context_layer_id': self.resource.id}
            ) + "?amenity=clinic",
            code=403,
            user=self.creator
        )
        self.assertRequestDeleteView(
            url=reverse(
                key, kwargs={'context_layer_id': self.resource.id}
            ) + "?amenity=clinic",
            code=403,
            user=self.contributor
        )

        # ----------------------------------------------
        # PATCH
        # ----------------------------------------------
        self.assertRequestPatchView(
            url=reverse(
                key, kwargs={'context_layer_id': self.resource.id}
            ) + "?amenity=clinic",
            code=403,
            user=self.viewer,
            data={}
        )
        # Put more data, return bad request
        self.assertRequestPatchView(
            url=reverse(
                key, kwargs={'context_layer_id': self.resource.id}
            ) + "?amenity=clinic",
            code=400,
            user=self.admin,
            data={}
        )
        # Just update 1 data but wrong field
        response = self.assertRequestPatchView(
            url=reverse(
                key, kwargs={'context_layer_id': self.resource.id}
            ) + "?amenity=clinic&osm_id=3455527618",
            code=400,
            user=self.admin,
            data={
                "non_field": "Jakarta",
                "non_field_2": "Jakarta",
            }
        )
        self.assertEqual(
            response.content.decode(), "Field does not exist: 'non_field'"
        )
        # Just update 1 data
        self.assertRequestPatchView(
            url=reverse(
                key, kwargs={'context_layer_id': self.resource.id}
            ) + "?amenity=clinic&osm_id=3455527618",
            code=204,
            user=self.admin,
            data={
                "addr_city": "Jakarta",
                "addr_house": "house 1",
                "completene": 10
            }
        )
        response = self.assertRequestGetView(
            url=reverse(
                key, kwargs={'context_layer_id': self.resource.id}
            ),
            code=200,
            user=self.admin
        )
        self.assertEqual(response.json()["count"], 47)
        response = self.assertRequestGetView(
            url=reverse(
                key, kwargs={'context_layer_id': self.resource.id}
            ) + "?amenity=clinic",
            code=200,
            user=self.admin
        )
        self.assertEqual(response.json()["count"], 13)
        response = self.assertRequestGetView(
            url=reverse(
                key, kwargs={'context_layer_id': self.resource.id}
            ) + "?amenity=clinic&osm_id=3455527618",
            code=200,
            user=self.admin
        )
        self.assertEqual(response.json()["count"], 1)
        self.assertEqual(
            response.json()["results"][0]["addr_city"], "Jakarta"
        )
        self.assertEqual(
            response.json()["results"][0]["addr_house"], "house 1"
        )
        self.assertEqual(
            response.json()["results"][0]["completene"], 10
        )

        # ----------------------------------------------
        # DELETE
        # ----------------------------------------------
        # Delete more data, return bad request
        self.assertRequestDeleteView(
            url=reverse(
                key, kwargs={'context_layer_id': self.resource.id}
            ) + "?amenity=clinic",
            code=400,
            user=self.admin
        )
        # Just delete 1 data
        self.assertRequestDeleteView(
            url=reverse(
                key, kwargs={'context_layer_id': self.resource.id}
            ) + "?amenity=clinic&osm_id=3455527618",
            code=204,
            user=self.admin
        )
        response = self.assertRequestGetView(
            url=reverse(
                key, kwargs={'context_layer_id': self.resource.id}
            ),
            code=200,
            user=self.admin
        )
        self.assertEqual(response.json()["count"], 46)
        response = self.assertRequestGetView(
            url=reverse(
                key, kwargs={'context_layer_id': self.resource.id}
            ) + "?amenity=clinic",
            code=200,
            user=self.admin
        )
        self.assertEqual(response.json()["count"], 12)
        response = self.assertRequestGetView(
            url=reverse(
                key, kwargs={'context_layer_id': self.resource.id}
            ) + "?amenity=clinic&osm_id=3455527618",
            code=200,
            user=self.admin
        )
        self.assertEqual(response.json()["count"], 0)

        # ----------------------------------------------
        # TEST INSERT
        # ----------------------------------------------
        response = self.assertRequestPostView(
            url=reverse(
                key, kwargs={'context_layer_id': self.resource.id}
            ),
            code=403,
            user=self.viewer,
            data={}
        )
        response = self.assertRequestPostView(
            url=reverse(
                key, kwargs={'context_layer_id': self.resource.id}
            ),
            code=400,
            user=self.admin,
            data={}
        )
        self.assertTrue("Invalid payload format" in response.content.decode())
        response = self.assertRequestPostView(
            url=reverse(
                key, kwargs={'context_layer_id': self.resource.id}
            ),
            code=400,
            user=self.admin,
            data={
                "type": "FeatureCollection",
                "features": [
                    {
                        "type": "Feature",
                        "properties": {
                            "id": 10,
                            "name": "New shop",
                            "category": "shop"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [0, 0],
                                    [0, 1],
                                    [1, 1],
                                    [1, 0],
                                    [0, 0]
                                ]
                            ]
                        }
                    }
                ]
            },
            content_type=self.JSON_CONTENT
        )
        self.assertEqual(
            'column "id" does not exist', response.content.decode()
        )
        response = self.assertRequestPostView(
            url=reverse(
                key, kwargs={'context_layer_id': self.resource.id}
            ),
            code=400,
            user=self.admin,
            data={
                "type": "FeatureCollection",
                "features": [
                    {
                        "type": "Feature",
                        "properties": {
                            "name": "New shop"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [0, 0],
                                    [0, 1],
                                    [1, 1],
                                    [1, 0],
                                    [0, 0]
                                ]
                            ]
                        }
                    }
                ]
            },
            content_type=self.JSON_CONTENT
        )
        self.assertEqual(
            "Geometry type (Polygon) does not match column type (Point)",
            response.content.decode()
        )

        # Test success
        self.assertRequestPostView(
            url=reverse(
                key, kwargs={'context_layer_id': self.resource.id}
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
                key, kwargs={'context_layer_id': self.resource.id}
            ),
            code=200,
            user=self.admin
        )
        self.assertEqual(response.json()["count"], 48)

        # With the filter
        response = self.assertRequestGetView(
            url=reverse(
                key, kwargs={'context_layer_id': self.resource.id}
            ) + "?amenity=clinic",
            code=200,
            user=self.admin
        )
        self.assertEqual(response.json()["count"], 14)
        response = self.assertRequestGetView(
            url=reverse(
                key, kwargs={'context_layer_id': self.resource.id}
            ) + "?name__icontains=New clinic",
            code=200,
            user=self.admin
        )
        self.assertEqual(response.json()["count"], 2)
