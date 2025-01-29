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

import responses

from geosight.importer.exception import ImporterDoesNotExist
from geosight.importer.importers.base.indicator_value import (
    ImporterTimeDataType, IndicatorDataType
)
from geosight.importer.importers.query_data import Aggregations
from geosight.importer.importers.related_table import (
    RelatedTableLongFormatIndicatorValue
)
from geosight.importer.models import Importer, ImportType
from geosight.importer.models.log import LogStatus
from .base import BaseTest


class RelatedTableLayerIndicatorValueTest(BaseTest):
    """Test for Importer : Related Table Format Indicator Value."""

    def run_importer(self, attributes):
        """Run Importer with new attribute."""
        super().run_importer(attributes)

        # Assert field definitian
        fields_definition = sorted(
            self.related_table.fields_definition, key=lambda d: d['name']
        )
        self.assertEqual(fields_definition[0]['name'], 'admin_level')
        self.assertEqual(fields_definition[1]['name'], 'date_time')
        self.assertEqual(fields_definition[2]['name'], 'geom_code')
        self.assertEqual(fields_definition[3]['name'], 'indicator_shortcode')
        self.assertEqual(fields_definition[4]['name'], 'male')
        self.assertEqual(fields_definition[5]['name'], 'population')
        self.assertEqual(fields_definition[6]['name'], 'value')

    def test_error_importer(self):
        """Test if correct importer."""
        with self.assertRaises(ImporterDoesNotExist):
            Importer.objects.create(
                import_type=ImportType.INDICATOR_VALUE,
                input_format='test',
                reference_layer=self.reference_layer
            )

    def test_correct_importer(self):
        """Test if correct importer."""
        self.assertEqual(
            self.importer.importer, RelatedTableLongFormatIndicatorValue
        )

    def test_run_error_attributes(self):
        """Test if error attributes importer."""
        # by value but no date value
        attributes = {
            **self.attributes, **{
                'date_time_data_type': ImporterTimeDataType.BY_VALUE,
                'date_time_data_value': None
            }
        }
        self.importer.save_attributes(attributes, {})

        self.importer.run()
        self.assertEqual(
            self.importer.importerlog_set.all().first().status,
            LogStatus.FAILED
        )

        # data driven but no data value
        attributes = {
            **self.attributes, **{
                'date_time_data_type': ImporterTimeDataType.DATA_DRIVEN
            }
        }
        self.importer.save_attributes(attributes, {})
        self.importer.run()

        self.assertEqual(
            self.importer.importerlog_set.all().first().status,
            LogStatus.FAILED
        )

    @responses.activate
    def test_with_indicator_date_value(self):
        """Test the harvester intersect and count."""
        attributes = {
            'indicator_data_type': IndicatorDataType.BY_VALUE,
            'date_time_data_type': ImporterTimeDataType.BY_VALUE,
            'date_time_data_value': '2010-01-01',
        }

        # COUNT
        attributes['aggregation'] = Aggregations.COUNT
        self.run_importer(attributes)
        self.assertIndicatorValueByExcel(self.fixture, 'ind_date_val (COUNT)')

        # Max population
        attributes['aggregation'] = Aggregations.MAX + '(population)'
        self.run_importer(attributes)
        self.assertIndicatorValueByExcel(self.fixture, 'ind_date_val (MAX)')

        # Min population
        attributes['aggregation'] = Aggregations.MIN + '(population)'
        self.run_importer(attributes)
        self.assertIndicatorValueByExcel(self.fixture, 'ind_date_val (MIN)')

        # Average population
        attributes['aggregation'] = Aggregations.AVG + '(population)'
        self.run_importer(attributes)
        self.assertIndicatorValueByExcel(self.fixture, 'ind_date_val (AVG)')

        # COUNT
        attributes['aggregation'] = Aggregations.COUNT
        attributes['filter'] = 'population > 3 AND male > 2'
        self.run_importer(attributes)
        self.assertIndicatorValueByExcel(
            self.fixture, 'ind_date_val_filter (COUNT)'
        )

    @responses.activate
    def test_with_indicator_value(self):
        """Test the harvester intersect and count."""
        attributes = {
            'indicator_data_type': IndicatorDataType.BY_VALUE,
            'date_time_data_type': ImporterTimeDataType.DATA_DRIVEN,
            'date_time_data_field': 'date_time',
            'date_time_data_format': '%Y-%m-%d'
        }

        # COUNT
        attributes['aggregation'] = Aggregations.COUNT
        self.run_importer(attributes)
        self.assertIndicatorValueByExcel(self.fixture, 'ind_val (COUNT)')

        # Max population
        attributes['aggregation'] = Aggregations.MAX + '(population)'
        self.run_importer(attributes)
        self.assertIndicatorValueByExcel(self.fixture, 'ind_val (MAX)')

        # Min population
        attributes['aggregation'] = Aggregations.MIN + '(population)'
        self.run_importer(attributes)
        self.assertIndicatorValueByExcel(self.fixture, 'ind_val (MIN)')

        # Average population
        attributes['aggregation'] = Aggregations.AVG + '(population)'
        self.run_importer(attributes)
        self.assertIndicatorValueByExcel(self.fixture, 'ind_val (AVG)')

        # COUNT
        attributes['aggregation'] = Aggregations.COUNT
        attributes['filter'] = 'population > 3 AND male > 2'
        self.run_importer(attributes)
        self.assertIndicatorValueByExcel(
            self.fixture, 'ind_val_filter (COUNT)'
        )

    @responses.activate
    def test_with_date_value(self):
        """Test the harvester intersect and count."""
        attributes = {
            'indicator_data_type': IndicatorDataType.DATA_DRIVEN,
            'indicator_data_field': 'indicator_shortcode',
            'date_time_data_type': ImporterTimeDataType.BY_VALUE,
            'date_time_data_value': '2010-01-01',
        }
        # COUNT
        attributes['aggregation'] = Aggregations.COUNT
        self.run_importer(attributes)
        self.assertIndicatorValueByExcel(self.fixture, 'date_val (COUNT)')

        # Max population
        attributes['aggregation'] = Aggregations.MAX + '(population)'
        self.run_importer(attributes)
        self.assertIndicatorValueByExcel(self.fixture, 'date_val (MAX)')

        # Min population
        attributes['aggregation'] = Aggregations.MIN + '(population)'
        self.run_importer(attributes)
        self.assertIndicatorValueByExcel(self.fixture, 'date_val (MIN)')

        # Average population
        attributes['aggregation'] = Aggregations.AVG + '(population)'
        self.run_importer(attributes)
        self.assertIndicatorValueByExcel(self.fixture, 'date_val (AVG)')

        # COUNT
        attributes['aggregation'] = Aggregations.COUNT
        attributes['filter'] = 'population > 3 AND male > 2'
        self.run_importer(attributes)
        self.assertIndicatorValueByExcel(
            self.fixture, 'date_val_filter (COUNT)'
        )
