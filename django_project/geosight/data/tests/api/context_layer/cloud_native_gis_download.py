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
from unittest import mock

from cloud_native_gis.models.layer import Layer
from cloud_native_gis.models.layer_download import (
    DownloadStatus, LayerDownload
)
from cloud_native_gis.models.layer_upload import LayerUpload
from django.contrib.auth import get_user_model
from django.urls import reverse
from kombu.exceptions import OperationalError

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
            cloud_native_gis_layer_id=Layer.objects.create(created_by=user).pk,
            **payload
        )

    def test_download(self):
        """Test attributes."""
        key = "context_layers_data-download"
        self.assertRequestPostView(
            url=reverse(
                key, kwargs={'context_layer_id': self.resource.id}
            ),
            code=403,
            user=self.viewer,
            data={}
        )
        self.assertRequestPostView(
            url=reverse(
                key, kwargs={'context_layer_id': self.resource.id}
            ),
            code=403,
            user=self.creator,
            data={}
        )
        self.assertRequestPostView(
            url=reverse(
                key, kwargs={'context_layer_id': self.resource_2.id}
            ),
            code=400,
            user=self.admin,
            data={}
        )
        self.assertRequestPostView(
            url=reverse(
                key, kwargs={'context_layer_id': self.resource.id}
            ),
            code=200,
            user=self.admin,
            data={}
        )

    def test_download_broker_unavailable(self):
        """Test download when the task broker can not be reached."""
        key = "context_layers_data-download"
        with mock.patch.object(
                LayerDownload, 'schedule_task',
                side_effect=OperationalError(
                    'Error 111 connecting to 127.0.0.1:6379.'
                )
        ):
            response = self.assertRequestPostView(
                url=reverse(
                    key, kwargs={'context_layer_id': self.resource.id}
                ) + '?file_format=geojson',
                code=503,
                user=self.admin,
                data={}
            )
        self.assertEqual(response.json()['status'], 'failed')
        layer_download = LayerDownload.objects.get(
            unique_id=response.json()['uuid']
        )
        self.assertEqual(layer_download.status, DownloadStatus.FAILED)
        self.assertIn('Error 111', layer_download.note)
