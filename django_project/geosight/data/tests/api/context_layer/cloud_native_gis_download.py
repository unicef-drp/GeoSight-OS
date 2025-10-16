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
from cloud_native_gis.models.layer_upload import LayerUpload
from django.contrib.auth import get_user_model
from django.urls import reverse

from core.settings.utils import ABS_PATH
from geosight.data.models.context_layer import ContextLayer, LayerType
from geosight.permission.tests._base import BasePermissionTest

User = get_user_model()


class ContextLayerCloudNativeDownloadTest(BasePermissionTest.TestCase):
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

        self.resource_2 = ContextLayer.permissions.create(
            user=self.admin,
            **{
                'name': 'name 2',
                'layer_type': LayerType.VECTOR_TILE
            }
        )

    def create_resource(self, user):
        """Create resource function."""
        payload = copy.deepcopy(self.payload)
        return ContextLayer.permissions.create(
            user=user,
            **payload
        )

    def test_download(self):
        """Test attributes."""
        key = "context_layers_data-download"
        self.assertRequestGetView(
            url=reverse(
                key, kwargs={'context_layer_id': self.resource.id}
            ),
            code=403,
            user=self.viewer
        )
        self.assertRequestGetView(
            url=reverse(
                key, kwargs={'context_layer_id': self.resource.id}
            ),
            code=403,
            user=self.creator
        )
        self.assertRequestGetView(
            url=reverse(
                key, kwargs={'context_layer_id': self.resource_2.id}
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
        self.assertTrue(response.as_attachment)
        self.assertEqual(response.filename, "somalia.zip")

        response = self.assertRequestGetView(
            url=reverse(
                key,
                kwargs={'context_layer_id': self.resource.id}
            ) + "?extension=shapefile",
            code=200,
            user=self.admin
        )
        self.assertTrue(response.as_attachment)
        self.assertNotEqual(response.filename, "somalia.zip")
        self.assertTrue(response.filename.endswith('.zip'))

        response = self.assertRequestGetView(
            url=reverse(
                key,
                kwargs={'context_layer_id': self.resource.id}
            ) + "?extension=kml",
            code=200,
            user=self.admin
        )
        self.assertTrue(response.as_attachment)
        self.assertTrue(response.filename.endswith('.kml'))

        response = self.assertRequestGetView(
            url=reverse(
                key,
                kwargs={'context_layer_id': self.resource.id}
            ) + "?extension=geojson",
            code=200,
            user=self.admin
        )
        self.assertTrue(response.as_attachment)
        self.assertTrue(response.filename.endswith('.geojson'))
        file_bytes = b''.join(response.streaming_content)
        content = file_bytes.decode('utf-8')
        data = json.loads(content)
        self.assertEqual(len(data['features']), 47)

        response = self.assertRequestGetView(
            url=reverse(
                key,
                kwargs={'context_layer_id': self.resource.id}
            ) + "?extension=geopackage",
            code=200,
            user=self.admin
        )
        self.assertTrue(response.as_attachment)
        self.assertTrue(response.filename.endswith('.gpkg'))
