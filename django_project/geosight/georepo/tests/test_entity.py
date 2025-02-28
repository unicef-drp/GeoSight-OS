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
__date__ = '06/02/2025'
__copyright__ = ('Copyright 2023, Unicef')

from unittest.mock import patch

from django.db import connection

from core.tests.base_tests import APITestCase
from geosight.georepo.models.entity import Entity
from geosight.georepo.request.data import GeorepoEntity
from geosight.georepo.tests.model_factories.reference_layer import (
    ReferenceLayerF
)


class EntityTest(APITestCase):
    """Entity test."""

    def setUp(self):
        """To setup test."""
        self.reference_layer = ReferenceLayerF()
        GeorepoEntity(
            {
                'name': 'name',
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
        self.reference_layer_2 = ReferenceLayerF()
        GeorepoEntity(
            {
                'name': 'name',
                'ucode': 'O',
                'admin_level': 0
            }
        ).get_or_create(self.reference_layer_2)

    def test_create(self):
        """Get the data."""
        self.assertEqual(Entity.objects.all().count(), 8)
        self.assertEqual(self.reference_layer.entities_set.count(), 7)

    def test_entity_detail(self):
        """Test entity detail."""
        self.assertEqual(self.entity.parent.geom_id, 'A')
        self.assertEqual(self.entity.admin_level, 1)
        self.assertEqual(self.entity.children.count(), 1)
        self.assertEqual(self.entity.children[0].geom_id, 'AAA')
        self.assertEqual(self.entity.siblings.count(), 1)
        self.assertEqual(self.entity.siblings[0].geom_id, 'AB')
        self.assertEqual(self.entity.reference_layer_set.count(), 1)
        self.assertEqual(
            self.entity.reference_layer_set[0], self.reference_layer
        )
        self.assertEqual(self.entity.country.geom_id, 'A')

    def test_entity_country(self):
        """Test entity detail."""
        entity = Entity.objects.get(geom_id='AA')

        # Siblings
        self.assertEqual(entity.siblings.count(), 1)
        for sibling in entity.siblings:
            self.assertEqual(sibling.country, entity.country)

        # Children
        self.assertEqual(entity.children.count(), 1)
        for entity in entity.children:
            self.assertEqual(entity.country, entity.country)

        entity = Entity.objects.get(geom_id='BA')
        # Siblings
        self.assertEqual(entity.siblings.count(), 0)
        for sibling in entity.siblings:
            self.assertEqual(sibling.country, entity.country)

        # Children
        self.assertEqual(entity.children.count(), 1)
        for entity in entity.children:
            self.assertEqual(entity.country, entity.country)

    def test_assign_country_function(self):
        """Test assign_country."""
        with connection.cursor() as cursor:
            cursor.execute(
                """
                UPDATE geosight_georepo_entity AS entity SET country_id = NULL
                """
            )
        # Check it does not have country
        entity = Entity.objects.get(geom_id='AA')

        # Siblings
        self.assertEqual(entity.siblings.count(), 1)
        for sibling in entity.siblings:
            self.assertIsNone(sibling.country)

        # Children
        self.assertEqual(entity.children.count(), 1)
        for entity in entity.children:
            self.assertIsNone(entity.country)

        # Check it does not have country
        entity = Entity.objects.get(geom_id='BA')

        # Siblings
        self.assertEqual(entity.siblings.count(), 0)
        for sibling in entity.siblings:
            self.assertIsNone(sibling.country)

        # Children
        self.assertEqual(entity.children.count(), 1)
        for entity in entity.children:
            self.assertIsNone(entity.country)

        # Run the scripts
        Entity.assign_country(step=1)
        entity = Entity.objects.get(geom_id='AA')

        # Siblings
        self.assertEqual(entity.siblings.count(), 1)
        for sibling in entity.siblings:
            self.assertEqual(sibling.country, entity.country)

        # Children
        self.assertEqual(entity.children.count(), 1)
        for entity in entity.children:
            self.assertEqual(entity.country, entity.country)

        entity = Entity.objects.get(geom_id='BA')
        # Siblings
        self.assertEqual(entity.siblings.count(), 0)
        for sibling in entity.siblings:
            self.assertEqual(sibling.country, entity.country)

        # Children
        self.assertEqual(entity.children.count(), 1)
        for entity in entity.children:
            self.assertEqual(entity.country, entity.country)

    @patch.object(
        Entity, 'update_indicator_value_data', autospec=True
    )
    def test_check_update_indicator_value_data(self, mock_func):
        """Check update indicator value function being called.

        Should be just when the indicator name is updated.
        """
        entity = Entity.objects.get(geom_id='AA')
        self.assertEqual(mock_func.call_count, 0)
        entity.parents = []
        entity.save()
        self.assertEqual(mock_func.call_count, 0)
        entity.geom_id = 'geom_id'
        entity.save()
        self.assertEqual(mock_func.call_count, 0)
        entity.name = 'Name 2'
        entity.save()
        self.assertEqual(mock_func.call_count, 1)
        entity.concept_uuid = 'concept_uuid'
        entity.save()
        self.assertEqual(mock_func.call_count, 2)
        entity.start_date = '2020-01-01'
        entity.save()
        self.assertEqual(mock_func.call_count, 3)
        entity.end_date = '2021-01-01'
        entity.save()
        self.assertEqual(mock_func.call_count, 4)
        entity.refresh_from_db()
        entity.parents = []
        entity.save()
        self.assertEqual(mock_func.call_count, 4)
