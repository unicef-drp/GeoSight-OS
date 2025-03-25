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
__date__ = '20/03/2025'
__copyright__ = ('Copyright 2023, Unicef')

from django.contrib.auth import get_user_model
from django.urls import reverse

from geosight.georepo.request.data import GeorepoEntity
from geosight.georepo.tests.model_factories.reference_layer import (
    ReferenceLayerF
)
from geosight.permission.tests._base import BasePermissionTest

User = get_user_model()


class ReferenceDatasetEntityApiTest(BasePermissionTest.TestCase):
    """Test for ReferenceDataset Entity api."""

    def setUp(self):
        """To setup tests."""
        self.reference_layer = ReferenceLayerF(
            in_georepo=False
        )
        GeorepoEntity(
            {
                'name': "name'A",
                'ucode': 'A',
                'admin_level': 0
            }
        ).get_or_create(self.reference_layer)

        self.entity, _ = GeorepoEntity(
            {
                'name': 'name',
                'ucode': 'AA',
                'admin_level': 1,
                'parents': [
                    {'ucode': 'A', 'admin_level': 0},
                ]
            }
        ).get_or_create(self.reference_layer)

        GeorepoEntity(
            {
                'name': 'name',
                'ucode': 'AB',
                'admin_level': 1,
                'parents': [
                    {'ucode': 'A', 'admin_level': 0},
                ]
            }
        ).get_or_create(self.reference_layer)

        GeorepoEntity(
            {
                'name': 'name',
                'ucode': 'AAA',
                'admin_level': 2,
                'parents': [
                    {'ucode': 'A', 'admin_level': 0},
                    {'ucode': 'AA', 'admin_level': 1},
                ]
            }
        ).get_or_create(self.reference_layer)

        GeorepoEntity(
            {
                'name': 'name',
                'ucode': 'B',
                'admin_level': 0
            }
        ).get_or_create(self.reference_layer)

        GeorepoEntity(
            {
                'name': 'name',
                'ucode': 'BA',
                'admin_level': 1,
                'parents': [
                    {'ucode': 'B', 'admin_level': 0},
                ]
            }
        ).get_or_create(self.reference_layer)

        GeorepoEntity(
            {
                'name': 'name',
                'ucode': 'BAA',
                'admin_level': 2,
                'parents': [
                    {'ucode': 'B', 'admin_level': 0},
                    {'ucode': 'BA', 'admin_level': 1},
                ]
            }
        ).get_or_create(self.reference_layer)

        # Other entities
        self.reference_layer_2 = ReferenceLayerF(
            in_georepo=False
        )
        GeorepoEntity(
            {
                'name': 'name',
                'ucode': 'O',
                'admin_level': 0
            }
        ).get_or_create(self.reference_layer_2)

        # Other entities from Georepo
        self.reference_layer_3 = ReferenceLayerF(
            in_georepo=True
        )
        GeorepoEntity(
            {
                'name': 'name',
                'ucode': 'Georepo',
                'admin_level': 0
            }
        ).get_or_create(self.reference_layer_3)

    def test_list_api(self):
        """Test list API."""
        url = reverse('reference-datasets-entity-api-list')
        response = self.assertRequestGetView(url, 200)
        self.assertEqual(response.json()['count'], 8)
        response = self.assertRequestGetView(url + '?admin_level=0', 200)
        self.assertEqual(response.json()['count'], 3)
        response = self.assertRequestGetView(url + '?geom_id=AA', 200)
        self.assertEqual(response.json()['count'], 1)

    def test_detail_api(self):
        """Test list API."""
        url = reverse(
            'reference-datasets-entity-api-detail',
            kwargs={'geom_id': 'A'}
        )
        response = self.assertRequestGetView(url, 200)
        self.assertEqual(response.json()['name'], "name'A")
        self.assertEqual(response.json()['ucode'], 'A')
        self.assertEqual(response.json()['admin_level'], 0)

    def test_list_dataset_entity_list_api(self):
        """Test list entity from dataset API."""
        url = reverse(
            'reference-datasets-detail-entity-api-list',
            kwargs={'identifier': self.reference_layer.identifier}
        )
        response = self.assertRequestGetView(url, 200)
        self.assertEqual(response.json()['count'], 7)
        response = self.assertRequestGetView(url + '?admin_level=0', 200)
        self.assertEqual(response.json()['count'], 2)
        response = self.assertRequestGetView(url + '?geom_id=AA', 200)
        self.assertEqual(response.json()['count'], 1)
        response = self.assertRequestGetView(url + '?geom_id=O', 200)
        self.assertEqual(response.json()['count'], 0)

    def test_list_dataset_entity_detail_api(self):
        """Test list entity from dataset API."""
        url = reverse(
            'reference-datasets-detail-entity-api-detail',
            kwargs={
                'identifier': self.reference_layer.identifier, 'geom_id': 'A'
            }
        )
        response = self.assertRequestGetView(url, 200)
        self.assertEqual(response.json()['name'], "name'A")
        self.assertEqual(response.json()['ucode'], 'A')
        self.assertEqual(response.json()['admin_level'], 0)
