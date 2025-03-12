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

from django.db import connection

from core.tests.base_tests import TestCase
from geosight.data.models.indicator import IndicatorValue, IndicatorExtraValue
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
                'concept_uuid': 'concept_A',
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
        self.assertEquals(value.admin_level, 1)
        self.assertEquals(value.admin_level, entity.admin_level)
        self.assertEquals(value.concept_uuid, 'concept_AA')
        self.assertEquals(value.concept_uuid, entity.concept_uuid)
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
        self.assertEquals(value.country_geom_id, 'A')
        self.assertEquals(value.country_geom_id, entity.country.geom_id)

        # check indicator
        self.assertEquals(value.indicator_name, 'Indicator 1')
        self.assertEquals(value.indicator_shortcode, None)

        # Update indicator name
        indicator.name = "Indicator '1"
        indicator.save()
        value.refresh_from_db()
        self.assertEquals(value.indicator_name, "Indicator '1")

    def test_create_from_indicator(self):
        """Test create."""
        indicator = IndicatorF(name='Indicator 2', shortcode='Shortcode2')
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
        self.assertEquals(value.admin_level, 2)
        self.assertEquals(value.admin_level, entity.admin_level)
        self.assertEquals(value.concept_uuid, 'concept_AAA')
        self.assertEquals(value.concept_uuid, entity.concept_uuid)
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
        self.assertEquals(value.country_geom_id, 'A')
        self.assertEquals(value.country_geom_id, entity.country.geom_id)

        # check indicator
        self.assertEquals(value.indicator_name, indicator.name)
        self.assertEquals(value.indicator_shortcode, 'Shortcode2')
        self.assertEquals(value.indicator_shortcode, indicator.shortcode)

        # If the entity is country
        value = indicator.save_value(
            date='2020-05-01', geom_id='A', value=2,
            reference_layer=self.reference_layer.identifier,
            admin_level=0
        )
        self.assertIsNotNone(value.pk)
        self.assertEquals(value.indicator, indicator)
        self.assertEquals(value.date, '2020-05-01')
        self.assertEquals(value.geom_id, 'A')
        self.assertEquals(value.value, 2)

        entity = Entity.objects.get(geom_id=value.geom_id)
        self.assertEquals(value.entity, entity)
        self.assertEquals(value.entity_name, 'country')
        self.assertEquals(value.entity_name, entity.name)
        self.assertEquals(value.admin_level, 0)
        self.assertEquals(value.admin_level, entity.admin_level)
        self.assertEquals(value.concept_uuid, 'concept_A')
        self.assertEquals(value.concept_uuid, entity.concept_uuid)
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
        self.assertEquals(value.country, entity)
        self.assertEquals(value.country_name, 'country')
        self.assertEquals(value.country_name, entity.name)

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

    def test_entity_change(self):
        """Change when indicator name change."""
        entity_a, _ = GeorepoEntity(
            {
                'name': 'name',
                'concept_uuid': 'concept_D',
                'ucode': 'D',
                'admin_level': 0,
                'start_date': '2020-01-01 00:00:00',
                'end_date': '2021-01-01 00:00:00'
            }
        ).get_or_create(self.reference_layer)

        # Create the georepo entity
        country_b, _ = GeorepoEntity(
            {
                'name': 'name',
                'concept_uuid': 'concept_F',
                'ucode': 'F',
                'admin_level': 0,
                'start_date': '2020-01-01 00:00:00',
                'end_date': '2021-01-01 00:00:00'
            }
        ).get_or_create(self.reference_layer)
        entity_b, _ = GeorepoEntity(
            {
                'name': 'name',
                'concept_uuid': 'concept_FA',
                'ucode': 'FA',
                'admin_level': 1,
                'parents': [
                    {'ucode': 'F', 'admin_level': 0},
                ],
                'start_date': '2020-01-01 00:00:00',
                'end_date': '2021-01-01 00:00:00'
            }
        ).get_or_create(self.reference_layer)

        indicator = IndicatorF(name='Indicator A')
        value_a = IndicatorValueF(
            indicator=indicator,
            date='2020-01-01',
            geom_id='D',
            value=1
        )
        value_b = IndicatorValueF(
            indicator=indicator,
            date='2020-01-01',
            geom_id='FA',
            value=1
        )
        self.assertEquals(value_a.entity_name, entity_a.name)
        self.assertEquals(value_a.concept_uuid, entity_a.concept_uuid)
        self.assertEquals(value_a.admin_level, entity_a.admin_level)
        self.assertEquals(
            value_a.entity_start_date.strftime("%Y-%m-%d"),
            entity_a.start_date.strftime("%Y-%m-%d")
        )
        self.assertEquals(
            value_a.entity_end_date.strftime("%Y-%m-%d"),
            entity_a.end_date.strftime("%Y-%m-%d")
        )
        self.assertEquals(value_a.country_id, entity_a.id)

        self.assertEquals(value_b.entity_name, entity_b.name)
        self.assertEquals(value_b.concept_uuid, entity_b.concept_uuid)
        self.assertEquals(value_b.admin_level, entity_b.admin_level)
        self.assertEquals(
            value_b.entity_start_date.strftime("%Y-%m-%d"),
            entity_b.start_date.strftime("%Y-%m-%d")
        )
        self.assertEquals(
            value_b.entity_end_date.strftime("%Y-%m-%d"),
            entity_b.end_date.strftime("%Y-%m-%d")
        )
        self.assertEquals(value_b.country_id, entity_b.country.id)

        # Change the entity name
        entity_a.name = 'Entity A name'
        entity_a.save()
        value_a.refresh_from_db()
        value_b.refresh_from_db()
        self.assertEquals(value_a.entity_name, 'Entity A name')
        self.assertEquals(value_a.entity_name, entity_a.name)
        self.assertEquals(value_a.concept_uuid, entity_a.concept_uuid)
        self.assertEquals(value_a.admin_level, entity_a.admin_level)
        self.assertEquals(
            value_a.entity_start_date.strftime("%Y-%m-%d"),
            entity_a.start_date.strftime("%Y-%m-%d")
        )
        self.assertEquals(
            value_a.entity_end_date.strftime("%Y-%m-%d"),
            entity_a.end_date.strftime("%Y-%m-%d")
        )
        self.assertEquals(value_a.country_id, entity_a.id)

        self.assertEquals(value_b.entity_name, 'name')
        self.assertEquals(value_b.entity_name, entity_b.name)
        self.assertEquals(value_b.concept_uuid, entity_b.concept_uuid)
        self.assertEquals(value_b.admin_level, entity_b.admin_level)
        self.assertEquals(
            value_b.entity_start_date.strftime("%Y-%m-%d"),
            entity_b.start_date.strftime("%Y-%m-%d")
        )
        self.assertEquals(
            value_b.entity_end_date.strftime("%Y-%m-%d"),
            entity_b.end_date.strftime("%Y-%m-%d")
        )
        self.assertEquals(value_b.country_id, entity_b.country.id)

        # # When the country itself changed
        country_b.name = 'Country b name'
        country_b.geom_id = 'GEOM_B'
        country_b.save()
        value_b.refresh_from_db()
        entity_b.country.refresh_from_db()
        self.assertEquals(value_b.country_id, entity_b.country.id)
        self.assertEquals(value_b.country_name, 'Country b name')
        self.assertEquals(value_b.country_name, entity_b.country.name)
        self.assertEquals(value_b.country_geom_id, 'GEOM_B')
        self.assertEquals(value_b.country_geom_id, entity_b.country.geom_id)

    def test_assign_flat_table(self):
        """Test assign flat table script."""
        indicator = IndicatorF(name='Indicator 2')
        value_a = indicator.save_value(
            date='2020-05-01', geom_id='AAA', value=2,
            reference_layer=self.reference_layer.identifier,
            admin_level=2
        )
        IndicatorExtraValue.objects.create(
            indicator_value=value_a, name='Extra 1', value=1
        )
        self.assertIsNotNone(value_a.pk)
        self.assertEquals(value_a.indicator, indicator)
        self.assertEquals(value_a.date, '2020-05-01')
        self.assertEquals(value_a.geom_id, 'AAA')
        self.assertEquals(value_a.value, 2)

        entity = Entity.objects.get(geom_id=value_a.geom_id)
        self.assertEquals(value_a.entity, entity)
        self.assertEquals(value_a.entity_name, 'name')
        self.assertEquals(value_a.entity_name, entity.name)
        self.assertEquals(value_a.admin_level, 2)
        self.assertEquals(value_a.admin_level, entity.admin_level)
        self.assertEquals(value_a.concept_uuid, 'concept_AAA')
        self.assertEquals(value_a.concept_uuid, entity.concept_uuid)
        self.assertEquals(
            value_a.entity_start_date.strftime("%Y-%m-%d %H:%M:%S"),
            '2020-01-01 00:00:00'
        )
        self.assertEquals(value_a.entity_start_date, entity.start_date)
        self.assertEquals(
            value_a.entity_end_date.strftime("%Y-%m-%d %H:%M:%S"),
            '2021-01-01 00:00:00'
        )
        self.assertEquals(value_a.entity_end_date, entity.end_date)

        self.assertIsNotNone(value_a.country)
        self.assertEquals(value_a.country, entity.country)
        self.assertEquals(value_a.country_name, 'country')
        self.assertEquals(value_a.country_name, entity.country.name)
        self.assertEquals(value_a.country_geom_id, 'A')
        self.assertEquals(value_a.country_geom_id, entity.country.geom_id)
        self.assertEquals(value_a.extra_value, None)

        # check indicator
        self.assertEquals(value_a.indicator_name, indicator.name)

        # If the entity is country
        value_b = indicator.save_value(
            date='2020-05-01', geom_id='A', value=2,
            reference_layer=self.reference_layer.identifier,
            admin_level=0
        )
        self.assertIsNotNone(value_b.pk)
        self.assertEquals(value_b.indicator, indicator)
        self.assertEquals(value_b.date, '2020-05-01')
        self.assertEquals(value_b.geom_id, 'A')
        self.assertEquals(value_b.value, 2)

        entity = Entity.objects.get(geom_id=value_b.geom_id)
        self.assertEquals(value_b.entity, entity)
        self.assertEquals(value_b.entity_name, 'country')
        self.assertEquals(value_b.entity_name, entity.name)
        self.assertEquals(value_b.admin_level, 0)
        self.assertEquals(value_b.admin_level, entity.admin_level)
        self.assertEquals(value_b.concept_uuid, 'concept_A')
        self.assertEquals(value_b.concept_uuid, entity.concept_uuid)
        self.assertEquals(
            value_b.entity_start_date.strftime("%Y-%m-%d %H:%M:%S"),
            '2020-01-01 00:00:00'
        )
        self.assertEquals(value_b.entity_start_date, entity.start_date)
        self.assertEquals(
            value_b.entity_end_date.strftime("%Y-%m-%d %H:%M:%S"),
            '2021-01-01 00:00:00'
        )
        self.assertEquals(value_b.entity_end_date, entity.end_date)

        self.assertIsNotNone(value_b.country)
        self.assertEquals(value_b.country, entity)
        self.assertEquals(value_b.country_name, 'country')
        self.assertEquals(value_b.country_name, entity.name)

        # check indicator
        self.assertEquals(value_b.indicator_name, indicator.name)
        self.assertEquals(value_b.indicator_shortcode, indicator.shortcode)

        # Remove the value
        with connection.cursor() as cursor:
            cursor.execute(
                f"""
                UPDATE geosight_data_indicatorvalue
                SET
                    country_id = NULL,
                    country_name = NULL,
                    country_geom_id = NULL,
                    entity_id = NULL,
                    entity_name = NULL,
                    admin_level = NULL,
                    concept_uuid = NULL,
                    entity_start_date = NULL,
                    entity_end_date = NULL,
                    indicator_name = NULL,
                    indicator_shortcode = NULL,
                    extra_value = NULL
                WHERE id IN ({value_a.pk},{value_b.pk})
                """
            )
        value_a.refresh_from_db()
        value_b.refresh_from_db()
        self.assertIsNone(value_a.country_id)
        self.assertIsNone(value_a.country_name)
        self.assertIsNone(value_a.country_geom_id)
        self.assertIsNone(value_a.entity_id)
        self.assertIsNone(value_a.entity_name)
        self.assertIsNone(value_a.admin_level)
        self.assertIsNone(value_a.concept_uuid)
        self.assertIsNone(value_a.entity_start_date)
        self.assertIsNone(value_a.entity_end_date)
        self.assertIsNone(value_a.indicator_name)
        self.assertIsNone(value_a.extra_value)
        self.assertIsNone(value_b.country_id)
        self.assertIsNone(value_b.country_name)
        self.assertIsNone(value_b.country_geom_id)
        self.assertIsNone(value_b.entity_id)
        self.assertIsNone(value_b.entity_name)
        self.assertIsNone(value_b.admin_level)
        self.assertIsNone(value_b.concept_uuid)
        self.assertIsNone(value_b.entity_start_date)
        self.assertIsNone(value_b.entity_end_date)
        self.assertIsNone(value_b.indicator_name)
        self.assertIsNone(value_b.extra_value)

        # Assign flat table
        IndicatorValue.assign_flat_table(step=1)
        value_a.refresh_from_db()
        value_b.refresh_from_db()

        # Check values
        self.assertIsNotNone(value_a.pk)
        self.assertEquals(value_a.indicator, indicator)
        self.assertEquals(value_a.date.strftime("%Y-%m-%d"), '2020-05-01')
        self.assertEquals(value_a.geom_id, 'AAA')
        self.assertEquals(value_a.value, 2)

        entity = Entity.objects.get(geom_id=value_a.geom_id)
        self.assertEquals(value_a.entity, entity)
        self.assertEquals(value_a.entity_name, 'name')
        self.assertEquals(value_a.entity_name, entity.name)
        self.assertEquals(value_a.admin_level, 2)
        self.assertEquals(value_a.admin_level, entity.admin_level)
        self.assertEquals(value_a.concept_uuid, 'concept_AAA')
        self.assertEquals(value_a.concept_uuid, entity.concept_uuid)
        self.assertEquals(
            value_a.entity_start_date.strftime("%Y-%m-%d %H:%M:%S"),
            '2020-01-01 00:00:00'
        )
        self.assertEquals(
            value_a.entity_start_date, entity.start_date
        )
        self.assertEquals(
            value_a.entity_end_date.strftime("%Y-%m-%d %H:%M:%S"),
            '2021-01-01 00:00:00'
        )
        self.assertEquals(value_a.entity_end_date, entity.end_date)

        self.assertIsNotNone(value_a.country)
        self.assertEquals(value_a.country, entity.country)
        self.assertEquals(value_a.country_name, 'country')
        self.assertEquals(value_a.country_name, entity.country.name)
        self.assertEquals(value_a.country_geom_id, 'A')
        self.assertEquals(value_a.country_geom_id, entity.country.geom_id)
        self.assertEquals(value_a.extra_value, {'Extra 1': '1'})

        # check indicator
        self.assertEquals(value_a.indicator_name, indicator.name)

        # If the entity is country
        value_b = indicator.save_value(
            date='2020-05-01', geom_id='A', value=2,
            reference_layer=self.reference_layer.identifier,
            admin_level=0
        )
        self.assertIsNotNone(value_b.pk)
        self.assertEquals(value_b.indicator, indicator)
        self.assertEquals(
            value_b.date.strftime("%Y-%m-%d"), '2020-05-01'
        )
        self.assertEquals(value_b.geom_id, 'A')
        self.assertEquals(value_b.value, 2)

        entity = Entity.objects.get(geom_id=value_b.geom_id)
        self.assertEquals(value_b.entity, entity)
        self.assertEquals(value_b.entity_name, 'country')
        self.assertEquals(value_b.entity_name, entity.name)
        self.assertEquals(value_b.admin_level, 0)
        self.assertEquals(value_b.admin_level, entity.admin_level)
        self.assertEquals(value_b.concept_uuid, 'concept_A')
        self.assertEquals(value_b.concept_uuid, entity.concept_uuid)
        self.assertEquals(
            value_b.entity_start_date.strftime("%Y-%m-%d %H:%M:%S"),
            '2020-01-01 00:00:00'
        )
        self.assertEquals(value_b.entity_start_date, entity.start_date)
        self.assertEquals(
            value_b.entity_end_date.strftime("%Y-%m-%d %H:%M:%S"),
            '2021-01-01 00:00:00'
        )
        self.assertEquals(value_b.entity_end_date, entity.end_date)

        self.assertIsNotNone(value_b.country)
        self.assertEquals(value_b.country, entity)
        self.assertEquals(value_b.country_name, 'country')
        self.assertEquals(value_b.country_name, entity.name)
        self.assertEquals(value_b.country_geom_id, 'A')
        self.assertEquals(value_b.country_geom_id, entity.geom_id)
        self.assertIsNone(value_b.extra_value)

        # check indicator
        self.assertEquals(value_b.indicator_name, indicator.name)
        self.assertEquals(value_b.indicator_shortcode, indicator.shortcode)
