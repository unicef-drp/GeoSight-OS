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
                'admin_level': 1
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

        # Other entities
        _reference_layer = ReferenceLayerF()
        GeorepoEntity(
            {
                'name': 'name',
                'ucode': 'O',
                'admin_level': 0
            }
        ).get_or_create(_reference_layer)

    def test_create(self):
        """Get the data."""
        self.assertEqual(Entity.objects.all().count(), 6)
        self.assertEqual(self.reference_layer.entities_set.count(), 5)

    def test_entity_detail(self):
        """Test entity detail."""
        self.assertEqual(self.entity.parent.geom_id, 'A')
        self.assertEqual(self.entity.children[0].geom_id, 'AAA')
        self.assertEqual(self.entity.siblings[0].geom_id, 'AB')
