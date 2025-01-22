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

import json

from django.contrib.auth import get_user_model
from django.urls import reverse

from geosight.data.models import Style
from geosight.permission.tests._base import BasePermissionTest

User = get_user_model()


class StyleApiTest(BasePermissionTest.TestCase):
    """Test for Style api."""

    def create_resource(self, user, name='name'):
        """Create resource function."""
        obj, _ = Style.objects.get_or_create(
            name=name
        )
        return obj

    def get_resources(self, user):
        """Create resource function."""
        return Style.objects.order_by('id')

    def test_list_api(self):
        """Test list API."""
        url = reverse('style-list-api')
        response = self.assertRequestGetView(url, 200)  # Non login
        self.assertEqual(len(response.json()), 1)
        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertEqual(len(response.json()), 1)

    def test_delete_multiple_api(self):
        """Test list API."""
        resource = self.create_resource(self.creator)
        url = reverse('style-list-api')
        self.assertRequestDeleteView(
            url, 403, self.viewer, data={'ids': json.dumps([resource.id])}
        )
        self.assertEqual(Style.objects.count(), 1)
        self.assertRequestDeleteView(
            url, 200, self.admin, data={'ids': json.dumps([resource.id])}
        )
        self.assertEqual(Style.objects.count(), 0)

    def test_delete_api(self):
        """Test list API."""
        resource = self.create_resource(self.creator, 'name 1')
        url = reverse('style-detail-api', kwargs={'pk': resource.id})
        self.assertRequestDeleteView(url, 403)
        self.assertRequestDeleteView(url, 403, self.viewer)
        self.assertRequestDeleteView(url, 403, self.contributor)
        self.assertRequestDeleteView(url, 403, self.resource_creator)
        self.assertRequestDeleteView(url, 200, self.admin)
        self.assertEqual(Style.objects.count(), 1)


from unittest.mock import MagicMock, patch
from django.test.client import MULTIPART_CONTENT
from geosight.permission.tests._base import APITestCase
from core.tests.model_factories.user import UserF


class GetRasterClassificationAPITest(APITestCase):
    """Test for GetRasterClassificationAPI."""
    url = reverse('raster-classification-api')

    @classmethod
    def setUpTestData(cls):
        cls.user = UserF(is_staff=True, is_superuser=True)

    def _send_request(self, data, mock_get):
        client = self.test_client()
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

        # response = client.post(self.url, data=data, content_type=MULTIPART_CONTENT)
        response = self.assertRequestPostView(
            url=self.url,
            data=data,
            user=self.user,
            content_type=MULTIPART_CONTENT,
            code=200
        )
        # self.assertEqual(response.status_code, 200)
        return response.json()

    @patch('requests.get')
    def test_get_natural_breaks(self, mock_get):
        """Test get natural breaks classification."""

        response = self._send_request(
            data={
                "url": (
                    "https://unidatadapmclimatechange.blob.core.windows.net/"
                    "public/heatwave/cogs_by_hwi/"
                    "average_heatwaves_duration_1960s_proj_COG.tif"
                ),
                "class_type": "natural_breaks",
                "class_num": 7,
                "colors": [ "#d73027", "#fc8d59", "#fee08b", "#ffffbf", "#d9ef8b", "#91cf60", "#1a9850" ]
            },
            mock_get=mock_get
        )
        expected_response = [
          {
            "bottom": 0.0,
            "top": 13.296875,
            "color": "#d73027"
          },
          {
            "bottom": 13.296875,
            "top": 17.5,
            "color": "#fc8d59"
          },
          {
            "bottom": 17.5,
            "top": 21.203125,
            "color": "#fee08b"
          },
          {
            "bottom": 21.203125,
            "top": 25.796875,
            "color": "#ffffbf"
          },
          {
            "bottom": 25.796875,
            "top": 34.90625,
            "color": "#d9ef8b"
          },
          {
            "bottom": 34.90625,
            "top": 48.8125,
            "color": "#91cf60"
          },
          {
            "bottom": 48.8125,
            "top": 78.8125,
            "color": "#1a9850"
          }
        ]
        self.assertListEqual(expected_response, response)

    @patch('requests.get')
    def test_get_equal_interval(self, mock_get):
        """Test get equal interval classification."""

        response = self._send_request(
            data={
                "url": (
                    "https://unidatadapmclimatechange.blob.core.windows.net/"
                    "public/heatwave/cogs_by_hwi/"
                    "average_heatwaves_duration_1960s_proj_COG.tif"
                ),
                "class_type": "equal_interval",
                "class_num": 7,
                "colors": [ "#d73027", "#fc8d59", "#fee08b", "#ffffbf", "#d9ef8b", "#91cf60", "#1a9850" ]
            },
            mock_get=mock_get
        )
        expected_response = [
          {
            "bottom": 0.0,
            "top": 11.258928571428571,
            "color": "#d73027"
          },
          {
            "bottom": 11.258928571428571,
            "top": 22.517857142857142,
            "color": "#fc8d59"
          },
          {
            "bottom": 22.517857142857142,
            "top": 33.776785714285715,
            "color": "#fee08b"
          },
          {
            "bottom": 33.776785714285715,
            "top": 45.035714285714285,
            "color": "#ffffbf"
          },
          {
            "bottom": 45.035714285714285,
            "top": 56.294642857142854,
            "color": "#d9ef8b"
          },
          {
            "bottom": 56.294642857142854,
            "top": 67.55357142857143,
            "color": "#91cf60"
          },
          {
            "bottom": 67.55357142857143,
            "top": 78.8125,
            "color": "#1a9850"
          }
        ]
        self.assertListEqual(expected_response, response)

    @patch('requests.get')
    def test_get_quantile(self, mock_get):
        """Test get quantile classification."""

        response = self._send_request(
            data={
                "url": (
                    "https://unidatadapmclimatechange.blob.core.windows.net/"
                    "public/heatwave/cogs_by_hwi/"
                    "average_heatwaves_duration_1960s_proj_COG.tif"
                ),
                "class_type": "quantile",
                "class_num": 7,
                "colors": [ "#d73027", "#fc8d59", "#fee08b", "#ffffbf", "#d9ef8b", "#91cf60", "#1a9850" ]
            },
            mock_get=mock_get
        )
        expected_response = [
          {
            "bottom": 0.0,
            "top": 0.0,
            "color": "#d73027"
          },
          {
            "bottom": 0.0,
            "top": 0.0,
            "color": "#fc8d59"
          },
          {
            "bottom": 0.0,
            "top": 0.0,
            "color": "#fee08b"
          },
          {
            "bottom": 0.0,
            "top": 0.0,
            "color": "#ffffbf"
          },
          {
            "bottom": 0.0,
            "top": 17.0,
            "color": "#d9ef8b"
          },
          {
            "bottom": 17.0,
            "top": 21.0,
            "color": "#91cf60"
          },
          {
            "bottom": 21.0,
            "top": 78.8125,
            "color": "#1a9850"
          }
        ]
        self.assertListEqual(expected_response, response)