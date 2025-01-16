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

import os
from unittest.mock import MagicMock, patch
from django.conf import settings

from core.tests.base_tests import TestCase
from geosight.data.serializer.context_layer import ContextLayerSerializer
from geosight.data.tests.model_factories import ContextLayerF


class BasemapLayerTest(TestCase):
    """Test for Basemap model."""

    def setUp(self):
        """To setup test."""
        self.name = 'Context Layer 1'
        self.params = {
            'param 1': 'value 1',
            'param 2': 'value 2',
            'param 3': 'value 3',
        }
        self.style = {
            'style 1': 'value 1',
            'style 2': 'value 2',
            'style 3': 'value 3',
        }

    def test_create(self):
        """Test create."""
        context_layer = ContextLayerF(
            name=self.name,
            url='test?' + '&'.join(
                [f'{key}={value}' for key, value in self.params.items()]
            )
        )

        context_layer_data = ContextLayerSerializer(context_layer).data
        self.assertEquals(context_layer_data['name'], self.name)
        for key, value in context_layer_data['parameters'].items():
            self.assertEquals(self.params[key], value)

    @patch('requests.get')
    def test_download_raster_cog(self, mock_get):
        """Test downloading raster cog file."""
        context_layer = ContextLayerF(
            name=self.name,
            url=(
                'https://unidatadapmclimatechange.blob.core.'
                'windows.net/public/'
                'heatwave/cogs_by_hwi/context_layer.tif'
            ),
            layer_type='Raster COG'
        )

        file_path = (
            '/home/web/django_project/geosight/data/'
            'tests/data/context_layer.tif'
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

        context_layer.download_layer()
        self.assertTrue(
            os.path.exists(
                os.path.join(settings.MEDIA_TEMP, 'context_layer.tif')
            )
        )

    @patch('requests.get')
    def test_download_wms(self, mock_get):
        """Test downloading wms file."""
        context_layer = ContextLayerF(
            name=self.name,
            url='http://url.com',
            layer_type='Raster Tile'
        )

        file_path = (
            '/home/web/django_project/geosight/data/'
            'tests/data/wms.tif'
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

        tmp_file_path = context_layer.download_layer(
            bbox=[41.0, 1.0, 51.0, 12.0]
        )
        self.assertTrue(os.path.exists(tmp_file_path))
        os.remove(tmp_file_path)
