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
__date__ = '01/03/2025'
__copyright__ = ('Copyright 2023, Unicef')

from core.tests.base_tests import APITestCase
from geosight.georepo.models.entity import Entity
from geosight.georepo.models.reference_layer import ReferenceLayerView
from geosight.georepo.request.data import GeorepoEntity
from geosight.georepo.tests.model_factories.reference_layer import (
    ReferenceLayerF
)


class ReferenceLayerViewTest(APITestCase):
    """ReferenceLayerView test."""

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
        self.assertEqual(ReferenceLayerView.objects.all().count(), 2)
        self.assertEqual(self.reference_layer.entities_set.count(), 7)

    def test_countries(self):
        """Test countries creation."""
        self.assertEqual(
            self.reference_layer.countries.all().count(), 2
        )
        self.assertEqual(
            list(
                self.reference_layer.countries.order_by('geom_id').values_list(
                    'geom_id', flat=True
                )
            ),
            ['A', 'B']
        )
        self.assertEqual(
            self.reference_layer_2.countries.all().count(), 1
        )
        self.assertEqual(
            list(
                self.reference_layer_2.countries.values_list(
                    'geom_id', flat=True
                )
            ),
            ['O']
        )
        Entity.objects.create(
            name='name',
            geom_id='C',
            admin_level=0,
            reference_layer=self.reference_layer
        )
        self.assertEqual(
            self.reference_layer.countries.all().count(), 3
        )
        self.assertEqual(
            list(
                self.reference_layer.countries.values_list(
                    'geom_id', flat=True
                )
            ),
            ['A', 'B', 'C']
        )

    def test_assign_countries(self):
        """Test countries creation."""
        self.reference_layer.countries.clear()
        self.reference_layer_2.countries.clear()
        self.assertEqual(
            self.reference_layer.countries.all().count(), 0
        )
        self.assertEqual(
            self.reference_layer_2.countries.all().count(), 0
        )

        # Assign countries
        self.reference_layer.assign_countries()
        self.reference_layer_2.assign_countries()

        # Reference layer 1
        self.assertEqual(
            self.reference_layer.countries.all().count(), 2
        )
        self.assertEqual(
            list(
                self.reference_layer.countries.order_by('geom_id').values_list(
                    'geom_id', flat=True
                )
            ),
            ['A', 'B']
        )

        # Reference layer 2
        self.assertEqual(
            self.reference_layer_2.countries.all().count(), 1
        )
        self.assertEqual(
            list(
                self.reference_layer_2.countries.values_list(
                    'geom_id', flat=True
                )
            ),
            ['O']
        )

    def test_assign_country(self):
        """Test countries creation."""
        self.reference_layer.countries.clear()
        self.reference_layer_2.countries.clear()
        self.assertEqual(
            self.reference_layer.countries.all().count(), 0
        )
        self.assertEqual(
            self.reference_layer_2.countries.all().count(), 0
        )
        for entity in Entity.objects.order_by('geom_id'):
            self.reference_layer.assign_country(entity)
            self.reference_layer_2.assign_country(entity)

        # Reference layer 1
        self.assertEqual(
            self.reference_layer.countries.all().count(), 2
        )
        self.assertEqual(
            list(
                self.reference_layer.countries.values_list(
                    'geom_id', flat=True
                )
            ),
            ['A', 'B']
        )

        # Reference layer 2
        self.assertEqual(
            self.reference_layer_2.countries.all().count(), 1
        )
        self.assertEqual(
            list(
                self.reference_layer_2.countries.values_list(
                    'geom_id', flat=True
                )
            ),
            ['O']
        )

        # Do assign with no check entity
        self.reference_layer_2.assign_country(
            self.entity.country, check_entity=False
        )
        # Reference layer 2
        self.assertEqual(
            self.reference_layer_2.countries.all().count(), 2
        )
        self.assertEqual(
            list(
                self.reference_layer_2.countries.order_by(
                    'geom_id'
                ).values_list(
                    'geom_id', flat=True
                )
            ),
            ['A', 'O']
        )
