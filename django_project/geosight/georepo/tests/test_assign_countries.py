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
__date__ = '19/05/2026'
__copyright__ = ('Copyright 2023, Unicef')

from unittest.mock import patch

from core.tests.base_tests import APITestCase
from geosight.georepo.models.entity import Entity
from geosight.georepo.request.data import GeorepoEntity
from geosight.georepo.tests.model_factories.reference_layer import (
    ReferenceLayerF
)


class AssignCountriesLocalTest(APITestCase):
    """Tests for assign_countries on local (non-GeoRepo) reference layers."""

    def setUp(self):
        """Set up local reference layers with entities."""
        self.local_layer = ReferenceLayerF(in_georepo=False)
        GeorepoEntity(
            {'name': 'Country A', 'ucode': 'A', 'admin_level': 0}
        ).get_or_create(self.local_layer)
        GeorepoEntity(
            {
                'name': 'Region AA', 'ucode': 'AA', 'admin_level': 1,
                'parents': [{'ucode': 'A', 'admin_level': 0}]
            }
        ).get_or_create(self.local_layer)
        GeorepoEntity(
            {'name': 'Country B', 'ucode': 'B', 'admin_level': 0}
        ).get_or_create(self.local_layer)

        self.local_layer_2 = ReferenceLayerF(in_georepo=False)
        GeorepoEntity(
            {'name': 'Country C', 'ucode': 'C', 'admin_level': 0}
        ).get_or_create(self.local_layer_2)

    def test_assign_countries_sets_admin_level_zero_entities(self):
        """Local path: countries are taken from entities_set at admin_level 0."""
        self.local_layer.countries.clear()
        self.assertEqual(self.local_layer.countries.count(), 0)

        self.local_layer.assign_countries()

        self.assertEqual(self.local_layer.countries.count(), 2)
        result = list(
            self.local_layer.countries.order_by('geom_id').values_list(
                'geom_id', flat=True
            )
        )
        self.assertEqual(result, ['A', 'B'])

    def test_assign_countries_excludes_non_country_entities(self):
        """Local path: sub-national entities are not added as countries."""
        self.local_layer.countries.clear()
        self.local_layer.assign_countries()

        country_geom_ids = set(
            self.local_layer.countries.values_list('geom_id', flat=True)
        )
        self.assertNotIn('AA', country_geom_ids)

    def test_assign_countries_replaces_existing_countries(self):
        """Local path: assign_countries replaces, not appends, the country set."""
        extra_entity = Entity.objects.get(geom_id='C')
        self.local_layer.countries.add(extra_entity)
        self.assertIn(
            'C',
            list(self.local_layer.countries.values_list('geom_id', flat=True))
        )

        self.local_layer.assign_countries()

        result = list(
            self.local_layer.countries.order_by('geom_id').values_list(
                'geom_id', flat=True
            )
        )
        self.assertEqual(result, ['A', 'B'])
        self.assertNotIn('C', result)

    def test_assign_countries_single_country_layer(self):
        """Local path: a layer with one country entity assigns exactly one."""
        self.local_layer_2.countries.clear()
        self.local_layer_2.assign_countries()

        self.assertEqual(self.local_layer_2.countries.count(), 1)
        self.assertEqual(
            list(
                self.local_layer_2.countries.values_list('geom_id', flat=True)
            ),
            ['C']
        )

    def test_assign_countries_empty_layer(self):
        """Local path: a layer with no entities ends up with no countries."""
        empty_layer = ReferenceLayerF(in_georepo=False)
        empty_layer.assign_countries()

        self.assertEqual(empty_layer.countries.count(), 0)


class AssignCountriesGeorepoTest(APITestCase):
    """Tests for assign_countries on GeoRepo-backed reference layers."""

    def setUp(self):
        """Set up GeoRepo-backed reference layer with matching Entity rows."""
        self.layer = ReferenceLayerF(in_georepo=True)
        Entity.objects.get_or_create(geom_id='A', defaults={'admin_level': 0})
        Entity.objects.get_or_create(geom_id='B', defaults={'admin_level': 0})
        Entity.objects.get_or_create(geom_id='X', defaults={'admin_level': 0})

    @patch('geosight.georepo.models.reference_layer.GeorepoRequest')
    def test_assign_countries_uses_api_ucodes(self, mock_georepo_cls):
        """GeoRepo path: countries come from the ucodes returned by the API."""
        mock_georepo_cls.return_value.View.get_detail.return_value = {
            'countries': [{'ucode': 'A'}, {'ucode': 'B'}]
        }

        self.layer.countries.clear()
        self.layer.assign_countries()

        mock_georepo_cls.return_value.View.get_detail.assert_called_once_with(
            self.layer.identifier
        )
        self.assertEqual(self.layer.countries.count(), 2)
        result = list(
            self.layer.countries.order_by('geom_id').values_list(
                'geom_id', flat=True
            )
        )
        self.assertEqual(result, ['A', 'B'])

    @patch('geosight.georepo.models.reference_layer.GeorepoRequest')
    def test_assign_countries_replaces_existing_via_api(self, mock_georepo_cls):
        """GeoRepo path: assign_countries replaces the previous country set."""
        extra = Entity.objects.get(geom_id='X')
        self.layer.countries.add(extra)

        mock_georepo_cls.return_value.View.get_detail.return_value = {
            'countries': [{'ucode': 'A'}]
        }

        self.layer.assign_countries()

        result = list(
            self.layer.countries.values_list('geom_id', flat=True)
        )
        self.assertEqual(result, ['A'])
        self.assertNotIn('X', result)

    @patch('geosight.georepo.models.reference_layer.GeorepoRequest')
    def test_assign_countries_empty_api_response(self, mock_georepo_cls):
        """GeoRepo path: empty countries list from API clears the country set."""
        mock_georepo_cls.return_value.View.get_detail.return_value = {
            'countries': []
        }
        self.layer.countries.add(Entity.objects.get(geom_id='A'))

        self.layer.assign_countries()

        self.assertEqual(self.layer.countries.count(), 0)

    @patch('geosight.georepo.models.reference_layer.GeorepoRequest')
    def test_assign_countries_ignores_unknown_ucodes(self, mock_georepo_cls):
        """GeoRepo path: ucodes with no matching Entity are silently skipped."""
        mock_georepo_cls.return_value.View.get_detail.return_value = {
            'countries': [{'ucode': 'A'}, {'ucode': 'DOES_NOT_EXIST'}]
        }

        self.layer.countries.clear()
        self.layer.assign_countries()

        self.assertEqual(self.layer.countries.count(), 1)
        self.assertEqual(
            list(self.layer.countries.values_list('geom_id', flat=True)),
            ['A']
        )