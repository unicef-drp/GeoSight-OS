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

import copy
import uuid
from unittest.mock import patch

from cloud_native_gis.forms import LayerUploadForm
from cloud_native_gis.models import (
    LayerUpload, Layer, LayerType as CloudNativeLayerType
)
from cloud_native_gis.utils.connection import count_features
from django.test import override_settings
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse

from core.settings.utils import ABS_PATH
from geosight.data.models.context_layer import (
    ContextLayer,
    LayerType,
    ZonalAnalysis
)
from geosight.permission.tests._base import BasePermissionTest

User = get_user_model()


class TestCloudNativeZonalAnalysis(BasePermissionTest.TestCase):
    """Test Raster Zonal Analysis."""

    payload = {
        'name': 'name',
        'url': 'url',
        'layer_type': LayerType.CLOUD_NATIVE_GIS_LAYER,
        'group': 'group'
    }
    geometries = """
    [
        {"type": "Point", "coordinates": [0,0]},
        {"type": "LineString", "coordinates": [[0,0],[0,1]]},
        {"type": "MultiPolygon", "coordinates": [ [ [ [ 41.943813481988578, 3.030485171480372 ], [ 44.68827186510039, 3.079845933766555 ], [ 44.777121237215518, 1.865571181526438 ], [ 41.983302091817528, 1.835954724154728 ], [ 41.943813481988578, 3.030485171480372 ] ] ] ] },
        {"type": "MultiPolygon", "coordinates": [ [ [ [ 43.434508503031324, 10.365494447207261 ], [ 44.303257919268155, 10.395110904578972 ], [ 44.313130071725389, 9.792909604687532 ], [ 43.602335094804346, 9.783037452230296 ], [ 43.434508503031324, 10.365494447207261 ] ] ] ] }
    ]
    """  # noqa E501

    def setUp(self):
        """To setup test."""
        super().setUp()
        self.layer = Layer.objects.create(
            name='Layer name',
            layer_type=CloudNativeLayerType.VECTOR_TILE,
            created_by=self.admin
        )
        self.resource.cloud_native_gis_layer_id = self.layer.id
        self.resource.save()

        # Run the upload form
        filepath = ABS_PATH(
            'geosight', 'data', 'tests', 'data', 'test.zip'
        )
        _file = open(filepath, 'rb')
        upload_form = LayerUploadForm(
            data={
                'layer': self.layer.id
            },
            files={
                'files': [SimpleUploadedFile(_file.name, _file.read())]
            }
        )
        upload_form.user = self.admin
        self.assertTrue(upload_form.is_valid())
        upload_form.save()
        layer_upload = LayerUpload.objects.filter(layer=self.layer).first()
        layer_upload.import_data()
        self.assertEqual(layer_upload.note, '')
        self.layer.refresh_from_db()

    def create_resource(self, user):
        """Create resource function."""
        payload = copy.deepcopy(self.payload)
        del payload['group']
        return ContextLayer.permissions.create(
            user=user,
            **payload
        )

    def test_layer(self):
        """Test layer."""
        self.assertEqual(
            self.layer.attribute_names, ['id', 'name', 'value']
        )
        self.assertEqual(
            count_features(self.layer.schema_name, self.layer.table_name),
            10
        )

    def _send_request(self, url, payload=None, method='post'):
        with patch('uuid.uuid4') as mock_uuid4:
            mocked_uuid = uuid.UUID("12345678-1234-5678-1234-567812345678")
            mock_uuid4.return_value = mocked_uuid
            client = self.test_client()
            client.login(
                username=self.admin.username,
                password=self.password
            )
            if method == 'post':
                return client.post(url, data=payload)
            else:
                return client.get(url)

    @override_settings(CELERY_TASK_ALWAYS_EAGER=True)
    def test_context_layer_count_bad_request(self):
        """Test zonal analysis for counting data."""
        url_run_analysis = reverse(
            'context-layer-zonal-analysis',
            args=[self.resource.id, 'count']
        )

        response = self._send_request(url_run_analysis, {})
        self.assertEqual(response.status_code, 400)

        # Check that Zonal Analysis API returns 200 status code
        response = self._send_request(url_run_analysis, {
            'geometries': self.geometries
        })
        self.assertEqual(response.status_code, 400)

        # Check that Zonal Analysis Result API returns 200 status code
        zonal_analysis = ZonalAnalysis.objects.filter(
            uuid='12345678-1234-5678-1234-567812345678'
        )
        self.assertFalse(zonal_analysis.exists())

    @override_settings(CELERY_TASK_ALWAYS_EAGER=True)
    def test_context_layer_count(self):
        """Test zonal analysis for counting data."""
        url = reverse(
            'context-layer-zonal-analysis',
            args=[self.resource.id, 'count']
        )
        response = self._send_request(url, {
            'aggregation_field': 'value',
            'geometries': self.geometries
        })
        self.assertEqual(response.status_code, 200)
        zonal_analysis = ZonalAnalysis.objects.get(
            uuid='12345678-1234-5678-1234-567812345678'
        )
        self.assertEqual(
            zonal_analysis.result,
            '4.0'
        )

    @override_settings(CELERY_TASK_ALWAYS_EAGER=True)
    def test_context_layer_sum(self):
        """Test zonal analysis for sum data."""
        url = reverse(
            'context-layer-zonal-analysis',
            args=[self.resource.id, 'sum']
        )
        response = self._send_request(url, {
            'aggregation_field': 'value',
            'geometries': self.geometries
        })
        self.assertEqual(response.status_code, 200)
        zonal_analysis = ZonalAnalysis.objects.get(
            uuid='12345678-1234-5678-1234-567812345678'
        )
        self.assertEqual(
            zonal_analysis.result,
            '5.0'
        )

    @override_settings(CELERY_TASK_ALWAYS_EAGER=True)
    def test_context_layer_max(self):
        """Test zonal analysis for max data."""
        url = reverse(
            'context-layer-zonal-analysis',
            args=[self.resource.id, 'max']
        )
        response = self._send_request(url, {
            'aggregation_field': 'value',
            'geometries': self.geometries
        })
        self.assertEqual(response.status_code, 200)
        zonal_analysis = ZonalAnalysis.objects.get(
            uuid='12345678-1234-5678-1234-567812345678'
        )
        self.assertEqual(
            zonal_analysis.result,
            '2.0'
        )

    @override_settings(CELERY_TASK_ALWAYS_EAGER=True)
    def test_context_layer_min(self):
        """Test zonal analysis for min data."""
        url = reverse(
            'context-layer-zonal-analysis',
            args=[self.resource.id, 'min']
        )
        response = self._send_request(url, {
            'aggregation_field': 'value',
            'geometries': self.geometries
        })
        self.assertEqual(response.status_code, 200)
        zonal_analysis = ZonalAnalysis.objects.get(
            uuid='12345678-1234-5678-1234-567812345678'
        )
        self.assertEqual(
            zonal_analysis.result,
            '0.0'
        )

    @override_settings(CELERY_TASK_ALWAYS_EAGER=True)
    def test_context_layer_avg(self):
        """Test zonal analysis for min data."""
        url = reverse(
            'context-layer-zonal-analysis',
            args=[self.resource.id, 'avg']
        )
        response = self._send_request(url, {
            'aggregation_field': 'value',
            'geometries': self.geometries
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.data,
            {
                'uuid': '12345678123456781234567812345678'
            }
        )
        zonal_analysis = ZonalAnalysis.objects.get(
            uuid='12345678-1234-5678-1234-567812345678'
        )
        self.assertEqual(
            zonal_analysis.result,
            '1.25'
        )

        url = reverse(
            'zonal-analysis-result',
            args=[zonal_analysis.uuid.hex]
        )
        response = self._send_request(url, None, 'get')

        # check result is returned when accessing the result endpoint
        self.assertEqual(
            response.data,
            {'status': 'SUCCESS', 'result': '1.25'}
        )

        # test that object is deleted
        try:
            zonal_analysis.refresh_from_db()
        except ZonalAnalysis.DoesNotExist:
            pass
        else:
            self.fail('Zonal Analysis object should be deleted!')
