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
from unittest.mock import MagicMock, patch

from django.contrib.auth import get_user_model
from django.test.client import MULTIPART_CONTENT
from django.urls import reverse

from geosight.data.models.context_layer import ContextLayer, LayerType
from geosight.permission.tests._base import BasePermissionTest

User = get_user_model()


class TestRasterZonalAnalysis(BasePermissionTest.TestCase):
    """Test Raster Zonal Analysis."""

    payload = {
        'name': 'name',
        'url': 'url',
        'layer_type': LayerType.RASTER_COG,
        'group': 'group'
    }

    def create_resource(self, user):
        """Create resource function."""
        payload = copy.deepcopy(self.payload)
        del payload['group']
        return ContextLayer.permissions.create(
            user=user,
            **payload
        )

    @patch('requests.get')
    def _send_request(self, url, mock_get):
        client = self.test_client()
        data = {
            'geometries': '[{"type":"Polygon","coordinates":[[[45.19738527596081,4.554035332048031],[45.90987617833042,4.260083544521251],[45.09911066873855,3.9905288280847344],[45.19738527596081,4.554035332048031]]]},{"type":"Polygon","coordinates":[[[46.74521033972894,6.021839943659998],[47.18744607223496,5.5329643557698205],[46.597798428894464,5.4840539720461265],[46.74521033972894,6.021839943659998]]]}]'
            # noqa
        }
        if self.creator:
            client.login(
                username=self.creator.username,
                password=self.password
            )

        file_path = (
            '/home/web/django_project/geosight/'
            'data/tests/data/context_layer.tif'
        )

        # Read the file in chunks and simulate `iter_content`
        # Mock response for requests.get
        mock_response = MagicMock()
        mock_response.status_code = 200

        # Simulate streaming content
        def mock_iter_content(chunk_size=8192):
            with open(file_path, "rb") as f:
                while chunk := f.read(chunk_size):
                    yield chunk

        mock_response.iter_content = MagicMock(side_effect=mock_iter_content)
        mock_get.return_value = mock_response

        response = client.post(url, data=data, content_type=MULTIPART_CONTENT)
        self.assertEqual(response.status_code, 200)
        return response

    def test_context_layer_sum(self):
        """Test zonal analysis sum for raster context layer."""
        url = reverse(
            'context-layer-zonal-analysis',
            args=[self.resource.id, 'sum']
        )
        response = self._send_request(url)
        self.assertEqual(float(response.content.decode('utf-8')), 364.2109375)

    def test_context_layer_avg(self):
        """Test zonal analysis average for raster context layer."""
        url = reverse(
            'context-layer-zonal-analysis',
            args=[self.resource.id, 'avg']
        )
        response = self._send_request(url)
        self.assertEqual(
            float(response.content.decode('utf-8')),
            13.007533073425293
        )

    def test_context_layer_min(self):
        """Test zonal analysis min for raster context layer."""
        url = reverse(
            'context-layer-zonal-analysis',
            args=[self.resource.id, 'min']
        )
        response = self._send_request(url)
        self.assertEqual(float(response.content.decode('utf-8')), 10.3984375)

    def test_context_layer_max(self):
        """Test zonal analysis max for raster context layer."""
        url = reverse(
            'context-layer-zonal-analysis',
            args=[self.resource.id, 'max']
        )
        response = self._send_request(url)
        self.assertEqual(float(response.content.decode('utf-8')), 15.0)

    def test_context_layer_count(self):
        """Test zonal analysis count for raster context layer."""
        url = reverse(
            'context-layer-zonal-analysis',
            args=[self.resource.id, 'count']
        )
        response = self._send_request(url)
        self.assertEqual(int(response.content.decode('utf-8')), 28)
