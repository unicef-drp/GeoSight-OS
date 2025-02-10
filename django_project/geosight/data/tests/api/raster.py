# coding=utf-8
"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""
__author__ = 'zakki@kartoza.com'
__date__ = '22/01/2023'
__copyright__ = ('Copyright 2025, Unicef')

from unittest.mock import MagicMock, patch

from django.test.client import MULTIPART_CONTENT
from django.urls import reverse

from core.tests.model_factories.user import UserF
from geosight.permission.tests._base import APITestCase
from geosight.data.models.style import COGClassification


class GetRasterClassificationAPITest(APITestCase):
    """Test for GetRasterClassificationAPI."""

    url = reverse('raster-classification-api')

    @classmethod
    def setUpTestData(cls):
        """Prepare test data."""
        cls.user = UserF(is_staff=True, is_superuser=True)

    def _send_request(self, data, mock_get):
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

        response = self.assertRequestPostView(
            url=self.url,
            data=data,
            user=self.user,
            content_type=MULTIPART_CONTENT,
            code=200
        )
        return response.json()

    def _check_response(self, payload, response, expected_response):
        """Check test response."""
        self.assertListEqual(expected_response, response)
        if payload.get('minimum', None) is None:
            cog_classifications = COGClassification.objects.filter(
                url=payload['url'],
                type=payload['class_type'],
                number=payload['class_num']
            )
        else:
            cog_classifications = COGClassification.objects.filter(
                url=payload['url'],
                type=payload['class_type'],
                number=payload['class_num'],
                min_value=payload['minimum'],
                max_value=payload['maximum']
            )
        self.assertTrue(cog_classifications.count(), 1)
        self.assertNotEquals(cog_classifications[0].result, [])

    @patch('requests.get')
    def test_get_natural_breaks(self, mock_get):
        """Test get natural breaks classification."""
        payload = {
            "url": (
                "https://unidatadapmclimatechange.blob.core.windows.net/"
                "public/heatwave/cogs_by_hwi/"
                "average_heatwaves_duration_1960s_proj_COG.tif"
            ),
            "class_type": "Natural breaks.",
            "class_num": 7,
            "colors": [
                "#d73027",
                "#fc8d59",
                "#fee08b",
                "#ffffbf",
                "#d9ef8b",
                "#91cf60",
                "#1a9850"
            ],
            "minimum": 0,
            "maximum": 100
        }
        response = self._send_request(
            data=payload,
            mock_get=mock_get
        )
        expected_response = [
            0.0, 13.296875, 17.5,
            21.203125, 25.796875, 34.90625,
            48.8125, 100.0
        ]
        self._check_response(payload, response, expected_response)

    @patch('requests.get')
    def test_get_natural_breaks_no_minmax(self, mock_get):
        """Test get natural breaks classification with no minmax."""
        payload = {
            "url": (
                "https://unidatadapmclimatechange.blob.core.windows.net/"
                "public/heatwave/cogs_by_hwi/"
                "average_heatwaves_duration_1960s_proj_COG.tif"
            ),
            "class_type": "Natural breaks.",
            "class_num": 7,
            "colors": [
                "#d73027",
                "#fc8d59",
                "#fee08b",
                "#ffffbf",
                "#d9ef8b",
                "#91cf60",
                "#1a9850"
            ]
        }
        response = self._send_request(
            data=payload,
            mock_get=mock_get
        )
        expected_response = [
            0.0, 13.296875, 17.5,
            21.203125, 25.796875,
            34.90625, 48.8125, 78.8125
        ]
        self._check_response(payload, response, expected_response)

    @patch('requests.get')
    def test_get_equal_interval(self, mock_get):
        """Test get equal interval classification."""
        payload = {
            "url": (
                "https://unidatadapmclimatechange.blob.core.windows.net/"
                "public/heatwave/cogs_by_hwi/"
                "average_heatwaves_duration_1960s_proj_COG.tif"
            ),
            "class_type": "Equidistant.",
            "class_num": 7,
            "colors": [
                "#d73027",
                "#fc8d59",
                "#fee08b",
                "#ffffbf",
                "#d9ef8b",
                "#91cf60",
                "#1a9850"
            ],
            "minimum": 0,
            "maximum": 100
        }
        response = self._send_request(
            data=payload,
            mock_get=mock_get
        )
        expected_response = [
            0.0, 14.285714285714286, 28.571428571428573,
            42.85714285714286, 57.142857142857146,
            71.42857142857143, 85.71428571428572,
            100.0
        ]
        self._check_response(payload, response, expected_response)

    @patch('requests.get')
    def test_get_quantile(self, mock_get):
        """Test get quantile classification."""
        payload = {
            "url": (
                "https://unidatadapmclimatechange.blob.core.windows.net/"
                "public/heatwave/cogs_by_hwi/"
                "average_heatwaves_duration_1960s_proj_COG.tif"
            ),
            "class_type": "Quantile.",
            "class_num": 7,
            "colors": [
                "#d73027",
                "#fc8d59",
                "#fee08b",
                "#ffffbf",
                "#d9ef8b",
                "#91cf60",
                "#1a9850"
            ],
            "minimum": 0,
            "maximum": 100
        }
        response = self._send_request(
            data=payload,
            mock_get=mock_get
        )
        expected_response = [
            0.0, 14.5, 16.90625,
            18.59375, 20.09375, 22.0,
            24.5, 100.0
        ]
        self._check_response(payload, response, expected_response)
