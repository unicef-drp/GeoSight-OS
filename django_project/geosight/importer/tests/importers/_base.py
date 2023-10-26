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

from unittest.mock import patch

from dateutil import parser
from django.db import connection
from django.test.testcases import TestCase

from core.models.preferences import SitePreferences
from core.tests.model_factories import UserF
from geosight.data.models.code import Code, CodeList, CodeInCodeList
from geosight.data.models.indicator import IndicatorType, IndicatorValue
from geosight.data.tests.model_factories import (
    IndicatorF, IndicatorGroupF, IndicatorRuleF
)
from geosight.georepo.models.entity import Entity
from geosight.georepo.tests.mock import mock_get_entity, need_review
from geosight.georepo.tests.model_factories import ReferenceLayerF
from geosight.importer.utilities import json_from_excel


class BaseImporterTest(TestCase):
    """Base for Importer."""

    databases = {'default', 'temp'}

    admin_level = 1
    georepo_url = 'http://test.com'
    georepo_api_key = 'AAA'

    import_type = ''
    input_format = ''

    def setUp(self):
        """To setup tests."""
        preference = SitePreferences.preferences()
        preference.georepo_url = self.georepo_url
        preference.georepo_api_key = self.georepo_api_key
        preference.save()
        self.user = UserF()

        self.reference_layer = ReferenceLayerF()
        self.indicator = IndicatorF(
            shortcode='IND0', group=IndicatorGroupF()
        )
        IndicatorRuleF(indicator=self.indicator, rule='x==1')
        IndicatorRuleF(indicator=self.indicator, rule='x==2')
        IndicatorRuleF(indicator=self.indicator, rule='x==3')
        IndicatorRuleF(indicator=self.indicator, rule='x==4')

        # For others indicator
        self.indicator_1 = IndicatorF(
            group=IndicatorGroupF(),
            shortcode='IND1',
            type=IndicatorType.INTEGER,
            min_value=0,
            max_value=7
        )
        self.indicator_2 = IndicatorF(
            group=IndicatorGroupF(),
            shortcode='IND2',
            type=IndicatorType.FLOAT,
            aggregation_upper_level_allowed=True,
            min_value=0,
            max_value=7
        )
        codelist, created = CodeList.objects.get_or_create(name='name')
        for code in [
            'A', 'AA', 'AB', 'B', 'BA', 'BB', 'C', 'CA', 'CB', 'CC', 'D'
        ]:
            CodeInCodeList.objects.create(
                code=Code.objects.create(name=code, value=code),
                codelist=codelist
            )
        self.indicator_3 = IndicatorF(
            group=IndicatorGroupF(),
            shortcode='IND3',
            type=IndicatorType.STRING,
            codelist=codelist
        )

        # Create the entity
        entities = {
            'AA': ['A', 'Top'],
            'AB': ['A', 'Top'],
            'AC': ['A', 'Top'],
            'BA': ['B', 'Top'],
            'BB': ['B', 'Top'],
            'BC': ['B', 'Top'],
        }
        for geom_id, parents in entities.items():
            Entity.objects.get_or_create(
                reference_layer=self.reference_layer,
                geom_id=geom_id,
                admin_level=2,
                defaults={
                    'parents': parents
                }
            )

        # Patch
        self.entity_patcher = patch(
            'geosight.georepo.models.entity.Entity.get_entity',
            mock_get_entity
        )
        self.review_patcher = patch(
            'geosight.importer.models.importer.Importer.need_review',
            need_review
        )
        self.entity_patcher.start()
        self.review_patcher.start()

    def tearDown(self):
        """Stop the patcher."""
        self.entity_patcher.stop()
        self.review_patcher.stop()


class BaseIndicatorValueImporterTest(BaseImporterTest):
    """Base importer for indicator value."""

    def run_importer(self, importer, attributes: dict, files: dict):
        """Run Importer with new attribute."""
        importer.save_attributes(attributes, files)
        importer.run()
        log = importer.importerlog_set.all().last()
        self.assertEqual(log.status, 'Success')
        all_tables = connection.introspection.table_names()
        self.assertTrue(importer.data_table_name not in all_tables)

    def assertImporter(self, importer):
        """Assert importer when run."""
        curr_version = self.indicator_1.version
        importer.run()
        log = importer.importerlog_set.all().last()
        self.assertEqual(log.status, 'Success')

        self.assertFalse(curr_version != self.indicator_1.version)

        # Check for indicator 1
        values = self.indicator_1.query_values(
            reference_layer=self.reference_layer,
            admin_level=self.admin_level + 1
        )

        self.assertIsNone(values.filter(geom_id='A').first())
        self.assertIsNone(values.filter(geom_id='B').first())
        self.assertIsNone(values.filter(geom_id='C').first())

        # for same level
        values = self.indicator_1.query_values(
            reference_layer=self.reference_layer,
            admin_level=self.admin_level
        )

        self.assertEqual(
            values.get(geom_id='A').val, 1
        )
        self.assertEqual(
            values.get(geom_id='A').date.strftime("%Y-%m-%d"),
            '2010-01-01'
        )
        self.assertEqual(
            values.get(geom_id='B').val, 2
        )
        self.assertEqual(
            values.get(geom_id='B').date.strftime("%Y-%m-%d"),
            '2010-01-01'
        )
        self.assertEqual(
            values.get(geom_id='C').val, 3
        )
        self.assertEqual(
            values.get(geom_id='C').date.strftime("%Y-%m-%d"),
            '2010-01-01'
        )

        # Check for indicator 2
        values = self.indicator_2.query_values(
            reference_layer=self.reference_layer,
            admin_level=self.admin_level + 1
        )

        self.assertIsNone(values.filter(geom_id='A').first())
        self.assertIsNone(values.filter(geom_id='B').first())
        self.assertIsNone(values.filter(geom_id='C').first())

        # for same level
        values = self.indicator_2.query_values(
            reference_layer=self.reference_layer,
            admin_level=self.admin_level
        )

        self.assertEqual(
            values.get(geom_id='A').val, 4.5
        )
        self.assertEqual(
            values.get(geom_id='A').date.strftime("%Y-%m-%d"),
            '2010-01-01'
        )
        self.assertEqual(
            values.get(geom_id='B').val, 5.5
        )
        self.assertEqual(
            values.get(geom_id='B').date.strftime("%Y-%m-%d"),
            '2010-01-01'
        )
        self.assertEqual(
            values.get(geom_id='C').val, 6.5
        )
        self.assertEqual(
            values.get(geom_id='C').date.strftime("%Y-%m-%d"),
            '2010-01-01'
        )

        # Check for indicator 3
        values = self.indicator_3.query_values(
            reference_layer=self.reference_layer,
            admin_level=self.admin_level + 1
        )

        self.assertIsNone(values.filter(geom_id='A').first())
        self.assertIsNone(values.filter(geom_id='B').first())
        self.assertIsNone(values.filter(geom_id='C').first())

        # for same level
        values = self.indicator_3.query_values(
            reference_layer=self.reference_layer,
            admin_level=self.admin_level
        )

        self.assertEqual(
            values.get(geom_id='A').val, 'A'
        )
        self.assertEqual(
            values.get(geom_id='A').date.strftime("%Y-%m-%d"),
            '2010-01-01'
        )
        self.assertEqual(
            values.get(geom_id='B').val, 'B'
        )
        self.assertEqual(
            values.get(geom_id='B').date.strftime("%Y-%m-%d"),
            '2010-01-01'
        )
        self.assertEqual(
            values.get(geom_id='C').val, 'C'
        )
        self.assertEqual(
            values.get(geom_id='C').date.strftime("%Y-%m-%d"),
            '2010-01-01'
        )

    def assertImporterLevelByData(self, importer):
        """Assert importer when run."""
        importer.run()
        log = importer.importerlog_set.all().last()
        self.assertEqual(log.status, 'Success')

        # Check for indicator 1
        values = self.indicator_1.query_values(
            reference_layer=self.reference_layer,
            admin_level=1
        )

        self.assertEqual(values.filter(geom_id='A').count(), 1)
        self.assertEqual(values.filter(geom_id='B').count(), 0)
        self.assertEqual(values.filter(geom_id='C').count(), 0)

        # Check for indicator 1
        values = self.indicator_1.query_values(
            reference_layer=self.reference_layer,
            admin_level=2
        )

        self.assertEqual(values.filter(geom_id='A').count(), 0)
        self.assertEqual(values.filter(geom_id='B').count(), 1)
        self.assertEqual(values.filter(geom_id='C').count(), 0)

        # Check for indicator 1
        values = self.indicator_1.query_values(
            reference_layer=self.reference_layer,
            admin_level=3
        )

        self.assertEqual(values.filter(geom_id='A').count(), 0)
        self.assertEqual(values.filter(geom_id='B').count(), 0)
        self.assertEqual(values.filter(geom_id='C').count(), 1)

        # Check for indicator 2
        values = self.indicator_2.query_values(
            reference_layer=self.reference_layer,
            admin_level=1
        )

        self.assertEqual(values.filter(geom_id='A').count(), 1)
        self.assertEqual(values.filter(geom_id='B').count(), 0)
        self.assertEqual(values.filter(geom_id='C').count(), 0)

        # Check for indicator 2
        values = self.indicator_2.query_values(
            reference_layer=self.reference_layer,
            admin_level=2
        )

        self.assertEqual(values.filter(geom_id='A').count(), 0)
        self.assertEqual(values.filter(geom_id='B').count(), 1)
        self.assertEqual(values.filter(geom_id='C').count(), 0)

        # Check for indicator 2
        values = self.indicator_2.query_values(
            reference_layer=self.reference_layer,
            admin_level=3
        )

        self.assertEqual(values.filter(geom_id='A').count(), 0)
        self.assertEqual(values.filter(geom_id='B').count(), 0)
        self.assertEqual(values.filter(geom_id='C').count(), 1)

        # Check for indicator 3
        values = self.indicator_3.query_values(
            reference_layer=self.reference_layer,
            admin_level=1
        )

        self.assertEqual(values.filter(geom_id='A').count(), 1)
        self.assertEqual(values.filter(geom_id='B').count(), 0)
        self.assertEqual(values.filter(geom_id='C').count(), 0)

        # Check for indicator 3
        values = self.indicator_3.query_values(
            reference_layer=self.reference_layer,
            admin_level=2
        )

        self.assertEqual(values.filter(geom_id='A').count(), 0)
        self.assertEqual(values.filter(geom_id='B').count(), 1)
        self.assertEqual(values.filter(geom_id='C').count(), 0)

        # Check for indicator 3
        values = self.indicator_3.query_values(
            reference_layer=self.reference_layer,
            admin_level=3
        )

        self.assertEqual(values.filter(geom_id='A').count(), 0)
        self.assertEqual(values.filter(geom_id='B').count(), 0)
        self.assertEqual(values.filter(geom_id='C').count(), 1)

    def assertIndicatorValueByExcel(
            self, filename: str, result_sheet_name: str
    ):
        """Assert results of importer using the excel.

        Excel contains columns : geom_code, date, indicator_shortcode, value
        And it will check the indicator value from each rows.
        """
        indicator_values = IndicatorValue.objects.filter(
            geom_id__in=Entity.objects.filter(
                reference_layer=self.reference_layer
            ).values_list(
                'geom_id', flat=True
            )
        )

        results = json_from_excel(filename, sheet_name=result_sheet_name)
        for result in results:
            geom_code = result['geom_code']
            value = result['value']
            indicator_value = indicator_values.get(
                geom_id=geom_code,
                date=parser.parse(result['date']),
                indicator__shortcode=result['indicator_shortcode']
            )
            try:
                self.assertEqual(
                    '{:.2f}'.format(indicator_value.value),
                    '{:.2f}'.format(float(value))
                )
            except (ValueError, TypeError):
                self.assertEqual(indicator_value.value_str, value)
            self.assertEqual(indicator_value.geom_id, geom_code)
