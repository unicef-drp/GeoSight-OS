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
__date__ = '28/02/2025'
__copyright__ = ('Copyright 2023, Unicef')

from core.tests.base_tests import TestCase
from geosight.data.tests.model_factories import (
    IndicatorValueF, IndicatorF
)
from geosight.georepo.models.entity import Entity
from geosight.georepo.request.data import GeorepoEntity
from geosight.georepo.tests.model_factories.reference_layer import (
    ReferenceLayerF
)


class IndicatorValueTest(TestCase):
    """Test for IndicatorValue model.

    Focus for flat table.
    """

    def setUp(self):
        """To setup test."""
        self.reference_layer = ReferenceLayerF()
        GeorepoEntity(
            {
                'name': 'country',
                'concept_uuid': 'A',
                'ucode': 'A',
                'admin_level': 0,
                'start_date': '2020-01-01 00:00:00',
                'end_date': '2021-01-01 00:00:00',
            }
        ).get_or_create(self.reference_layer)

        self.entity, _ = GeorepoEntity(
            {
                'name': 'name',
                'concept_uuid': 'concept_AA',
                'ucode': 'AA',
                'admin_level': 1,
                'parents': [
                    {'ucode': 'A', 'admin_level': 0},
                ],
                'start_date': '2020-01-01 00:00:00',
                'end_date': '2021-01-01 00:00:00'
            }
        ).get_or_create(self.reference_layer)

        GeorepoEntity(
            {
                'name': 'name',
                'concept_uuid': 'concept_AAA',
                'ucode': 'AAA',
                'admin_level': 2,
                'parents': [
                    {'ucode': 'A', 'admin_level': 0},
                    {'ucode': 'AA', 'admin_level': 1},
                ],
                'start_date': '2020-01-01 00:00:00',
                'end_date': '2021-01-01 00:00:00'
            }
        ).get_or_create(self.reference_layer)

    def test_create(self):
        """Test create."""
        indicator = IndicatorF(name='Indicator 1')
        value = IndicatorValueF(
            indicator=indicator,
            date='2020-01-01',
            geom_id='AA',
            value=1
        )
        self.assertIsNotNone(value.pk)
        self.assertEquals(value.indicator, indicator)
        self.assertEquals(value.date, '2020-01-01')
        self.assertEquals(value.geom_id, 'AA')
        self.assertEquals(value.value, 1)

        entity = Entity.objects.get(geom_id=value.geom_id)
        self.assertEquals(value.entity, entity)
        self.assertEquals(value.entity_name, 'name')
        self.assertEquals(value.entity_name, entity.name)
        self.assertEquals(value.entity_admin_level, 1)
        self.assertEquals(value.entity_admin_level, entity.admin_level)
        self.assertEquals(value.entity_concept_uuid, 'concept_AA')
        self.assertEquals(value.entity_concept_uuid, entity.concept_uuid)
        self.assertEquals(
            value.entity_start_date.strftime("%Y-%m-%d %H:%M:%S"),
            '2020-01-01 00:00:00'
        )
        self.assertEquals(value.entity_start_date, entity.start_date)
        self.assertEquals(
            value.entity_end_date.strftime("%Y-%m-%d %H:%M:%S"),
            '2021-01-01 00:00:00'
        )
        self.assertEquals(value.entity_end_date, entity.end_date)

        self.assertIsNotNone(value.country)
        self.assertEquals(value.country, entity.country)
        self.assertEquals(value.country_name, 'country')
        self.assertEquals(value.country_name, entity.country.name)

        # check indicator
        self.assertEquals(value.indicator_name, indicator.name)

    def test_create_from_indicator(self):
        """Test create."""
        indicator = IndicatorF(name='Indicator 2')
        value = indicator.save_value(
            date='2020-05-01', geom_id='AAA', value=2,
            reference_layer=self.reference_layer.identifier,
            admin_level=2
        )
        self.assertIsNotNone(value.pk)
        self.assertEquals(value.indicator, indicator)
        self.assertEquals(value.date, '2020-05-01')
        self.assertEquals(value.geom_id, 'AAA')
        self.assertEquals(value.value, 2)

        entity = Entity.objects.get(geom_id=value.geom_id)
        self.assertEquals(value.entity, entity)
        self.assertEquals(value.entity_name, 'name')
        self.assertEquals(value.entity_name, entity.name)
        self.assertEquals(value.entity_admin_level, 2)
        self.assertEquals(value.entity_admin_level, entity.admin_level)
        self.assertEquals(value.entity_concept_uuid, 'concept_AAA')
        self.assertEquals(value.entity_concept_uuid, entity.concept_uuid)
        self.assertEquals(
            value.entity_start_date.strftime("%Y-%m-%d %H:%M:%S"),
            '2020-01-01 00:00:00'
        )
        self.assertEquals(value.entity_start_date, entity.start_date)
        self.assertEquals(
            value.entity_end_date.strftime("%Y-%m-%d %H:%M:%S"),
            '2021-01-01 00:00:00'
        )
        self.assertEquals(value.entity_end_date, entity.end_date)

        self.assertIsNotNone(value.country)
        self.assertEquals(value.country, entity.country)
        self.assertEquals(value.country_name, 'country')
        self.assertEquals(value.country_name, entity.country.name)

        # check indicator
        self.assertEquals(value.indicator_name, indicator.name)

    def test_indicator_name_change(self):
        """Change when indicator name change."""
        indicator_a = IndicatorF(name='Indicator A')
        value_a = indicator_a.save_value(
            date='2020-05-01', geom_id='AAA', value=2,
            reference_layer=self.reference_layer.identifier,
            admin_level=2
        )
        indicator_b = IndicatorF(name='Indicator B')
        value_b = indicator_b.save_value(
            date='2020-05-01', geom_id='AAA', value=2,
            reference_layer=self.reference_layer.identifier,
            admin_level=2
        )
        self.assertEquals(value_a.indicator_name, indicator_a.name)
        self.assertEquals(value_b.indicator_name, indicator_b.name)

        # Change the indicator name
        indicator_b.name = 'Indicator B Update'
        indicator_b.save()
        value_a.refresh_from_db()
        value_b.refresh_from_db()
        self.assertEquals(value_a.indicator_name, 'Indicator A')
        self.assertEquals(value_a.indicator_name, indicator_a.name)
        self.assertEquals(value_b.indicator_name, 'Indicator B Update')
        self.assertEquals(value_b.indicator_name, indicator_b.name)
