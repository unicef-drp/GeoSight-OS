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
import json
from unittest.mock import MagicMock, patch

from django.contrib.auth import get_user_model
from django.urls import reverse
from django.test.client import MULTIPART_CONTENT

from geosight.data.models.context_layer import ContextLayer, LayerType
from geosight.permission.models.factory import PERMISSIONS
from geosight.permission.tests._base import BasePermissionTest
from geosight.data.tests.model_factories import ContextLayerF

User = get_user_model()


class ContextLayerListApiTest(BasePermissionTest.TestCase):
    """Test for context list api."""

    payload = {
        'name': 'name',
        'url': 'url',
        'layer_type': LayerType.ARCGIS,
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

    def get_resources(self, user):
        """Create resource function."""
        return ContextLayer.permissions.list(user).order_by('id')

    def test_list_api(self):
        """Test list API."""
        url = reverse('context-layer-list-api')
        self.permission.organization_permission = PERMISSIONS.NONE.name
        self.permission.public_permission = PERMISSIONS.NONE.name
        self.permission.save()

        # Check the list returned
        response = self.assertRequestGetView(url, 200)  # Non login
        self.assertEqual(len(response.json()), 0)

        response = self.assertRequestGetView(url, 200, self.viewer)  # Viewer
        self.assertEqual(len(response.json()), 0)

        response = self.assertRequestGetView(url, 200, self.contributor)
        self.assertEqual(len(response.json()), 0)

        response = self.assertRequestGetView(url, 200, self.creator)  # Creator
        self.assertEqual(len(response.json()), 0)

        response = self.assertRequestGetView(url, 200, self.viewer_in_group)
        self.assertEqual(len(response.json()), 0)

        response = self.assertRequestGetView(url, 200, self.creator_in_group)
        self.assertEqual(len(response.json()), 0)

        response = self.assertRequestGetView(
            url, 200, self.resource_creator)  # Creator
        self.assertEqual(len(response.json()), 1)

        response = self.assertRequestGetView(url, 200, self.admin)  # Admin
        self.assertEqual(len(response.json()), 1)

        # sharing
        self.permission.update_user_permission(
            self.contributor, PERMISSIONS.READ.name)
        self.assertRequestGetView(url, 200, self.contributor)
        response = self.assertRequestGetView(
            url, 200, self.contributor)  # Contributor
        self.assertEqual(len(response.json()), 1)

        self.permission.update_group_permission(
            self.group, PERMISSIONS.READ.name)
        self.assertRequestGetView(url, 200, self.viewer_in_group)
        response = self.assertRequestGetView(url, 200, self.viewer_in_group)
        self.assertEqual(len(response.json()), 1)

        self.assertRequestGetView(url, 200, self.creator_in_group)
        response = self.assertRequestGetView(url, 200, self.creator_in_group)
        self.assertEqual(len(response.json()), 1)

        self.permission.public_permission = PERMISSIONS.LIST.name
        self.permission.save()

        response = self.assertRequestGetView(url, 200, self.viewer)  # Viewer
        self.assertEqual(len(response.json()), 1)

        self.permission.organization_permission = PERMISSIONS.LIST.name
        self.permission.save()

        response = self.assertRequestGetView(url, 200)  # Viewer
        self.assertEqual(len(response.json()), 1)

    def test_delete_api(self):
        """Test list API."""
        resource = self.create_resource(self.creator)
        url = reverse('context-layer-detail-api', kwargs={'pk': resource.id})
        self.assertRequestDeleteView(url, 403)
        self.assertRequestDeleteView(url, 403, self.viewer)
        self.assertRequestDeleteView(url, 403, self.contributor)
        self.assertRequestDeleteView(url, 403, self.resource_creator)

        response = self.assertRequestGetView(
            reverse('context-layer-list-api'), 200, self.creator)
        self.assertEqual(len(response.json()), 1)

        self.assertRequestDeleteView(url, 200, self.creator)
        response = self.assertRequestGetView(
            reverse('context-layer-list-api'), 200, self.creator)
        self.assertEqual(len(response.json()), 0)

    def test_delete_multiple_api(self):
        """Test list API."""
        resource = self.create_resource(self.creator)
        url = reverse('context-layer-list-api')
        self.assertRequestDeleteView(
            url, 200, self.viewer, data={'ids': json.dumps([resource.id])}
        )
        self.assertEqual(ContextLayer.objects.count(), 2)
        self.assertRequestDeleteView(
            url, 200, self.creator, data={'ids': json.dumps([resource.id])}
        )
        self.assertEqual(ContextLayer.objects.count(), 1)

class TestRasterZonalAnalysis(BasePermissionTest.TestCase):

    payload = {
        'name': 'name',
        'url': 'url',
        'layer_type': LayerType.ARCGIS,
        'group': 'group'
    }

    def setUp(self):
        self.context_layer = ContextLayerF(
            name='Test Context Layer',
            url=(
                'https://unidatadapmclimatechange.blob.core.windows.net/public/'
                'heatwave/cogs_by_hwi/context_layer.tif'
            ),
            layer_type='Raster COG'
        )
        super(TestRasterZonalAnalysis, self).setUp()

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
        }
        if self.creator:
            client.login(username=self.creator.username, password=self.password)

        file_path = '/home/web/django_project/geosight/data/tests/data/context_layer.tif'

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
        url = reverse('context-layer-zonal-analysis', args=[self.context_layer.id, 'sum'])
        response = self._send_request(url)
        self.assertEqual(float(response.content.decode('utf-8')), 364.2109375)

    def test_context_layer_avg(self):
        url = reverse('context-layer-zonal-analysis', args=[self.context_layer.id, 'avg'])
        response = self._send_request(url)
        self.assertEqual(float(response.content.decode('utf-8')), 13.007533073425293)

    def test_context_layer_min(self):
        url = reverse('context-layer-zonal-analysis', args=[self.context_layer.id, 'min'])
        response = self._send_request(url)
        self.assertEqual(float(response.content.decode('utf-8')), 10.3984375)

    def test_context_layer_max(self):
        url = reverse('context-layer-zonal-analysis', args=[self.context_layer.id, 'max'])
        response = self._send_request(url)
        self.assertEqual(float(response.content.decode('utf-8')), 15.0)

    def test_context_layer_count(self):
        url = reverse('context-layer-zonal-analysis', args=[self.context_layer.id, 'count'])
        response = self._send_request(url)
        self.assertEqual(int(response.content.decode('utf-8')), 28)