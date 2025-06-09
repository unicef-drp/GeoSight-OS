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

import os
from unittest.mock import patch

from django.core.files import File
from django.core.files.uploadedfile import SimpleUploadedFile

from core.settings.utils import ABS_PATH
from geosight.data.models.indicator import IndicatorValue
from geosight.importer.exception import ImporterDoesNotExist
from geosight.importer.importers import IndicatorValueExcelLongFormat
from geosight.importer.importers.base.indicator_value import (
    ImporterTimeDataType, AdminLevelType, MultipleValueAggregationType
)
from geosight.importer.models import Importer, ImportType, InputFormat
from geosight.importer.models.log import LogStatus
from geosight.importer.tests.importers._base import (
    BaseIndicatorValueImporterTest
)


class ExcelLongFormatIndicatorValueTest(BaseIndicatorValueImporterTest):
    """Test for Importer : Excel Long Format Indicator Value."""

    attributes = {
        'sheet_name': 'Sheet 1',
        'row_number_for_header': 1,
        'key_administration_code': 'geom_code',
        'indicator_data_type': 'Data Driven',
        'indicator_data_field': 'indicator_shortcode',
        'admin_level_type': AdminLevelType.BY_VALUE,
        'admin_level_value': 1,
        'key_value': 'value',
        'date_time_data_type': 'By Value',
        'date_time_data_value': '2010-01-01'
    }

    def setUp(self):
        """To setup tests."""
        super().setUp()
        self.importer = Importer.objects.create(
            import_type=ImportType.INDICATOR_VALUE,
            input_format=InputFormat.EXCEL_LONG,
            reference_layer=self.reference_layer
        )

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
        self.assertEqual(self.importer.importer, IndicatorValueExcelLongFormat)

    def test_run_error_attributes(self):
        """Test if error attributes importer."""
        filepath = ABS_PATH(
            'geosight', 'importer', 'tests', 'importers',
            '_fixtures', 'excel_long_indicator_value_error.xlsx'
        )

        # by value but no date value
        with open(filepath, 'rb') as _file:
            attributes = {
                **self.attributes, **{
                    'date_time_data_type': ImporterTimeDataType.BY_VALUE,
                    'date_time_data_value': None
                }
            }
            files = {
                'file': File(_file, name=os.path.basename(_file.name))
            }
            self.importer.save_attributes(attributes, files)

        self.importer.run()
        self.assertEqual(
            self.importer.importerlog_set.all().first().status,
            LogStatus.FAILED
        )

        # data driven but no data value
        with open(filepath, 'rb') as _file:
            attributes = {
                **self.attributes, **{
                    'date_time_data_type': ImporterTimeDataType.DATA_DRIVEN
                }
            }
            files = {
                'file': File(_file, name=os.path.basename(_file.name))
            }
            self.importer.save_attributes(attributes, files)

        self.importer.run()
        self.assertEqual(
            self.importer.importerlog_set.all().first().status,
            LogStatus.FAILED
        )

    def test_run_error(self):
        """Test if correct importer."""
        filepath = ABS_PATH(
            'geosight', 'importer', 'tests', 'importers',
            '_fixtures', 'excel_long_indicator_value_error.xlsx'
        )

        with open(filepath, 'rb') as _file:
            attributes = self.attributes
            files = {
                'file': File(_file, name=os.path.basename(_file.name))
            }
            self.importer.save_attributes(attributes, files)

        self.importer.run()
        log = self.importer.importerlog_set.all().last()
        self.assertEqual(log.status, 'Failed')

    def test_run(self):
        """Test if correct importer."""
        filepath = ABS_PATH(
            'geosight', 'importer', 'tests', 'importers',
            '_fixtures', 'excel_long_indicator_value.xlsx'
        )

        with open(filepath, 'rb') as _file:
            attributes = self.attributes
            files = {
                'file': File(_file, name=os.path.basename(_file.name))
            }
            self.importer.save_attributes(attributes, files)

        self.assertImporter(self.importer)

    @patch(
        'django.db.models.fields.files.FieldFile.save',
        side_effect=FileNotFoundError("File does not found")
    )
    def test_error_file_not_found(self, mock_file):
        """Test error file not found."""
        mock_file = SimpleUploadedFile("missing.xlsx", b"fake content")
        files = {'file': mock_file}
        with self.assertRaises(FileNotFoundError):
            self.importer.save_attributes(self.attributes, files)

    def test_run_using_date_time_field(self):
        """Test if correct importer."""
        filepath = ABS_PATH(
            'geosight', 'importer', 'tests', 'importers',
            '_fixtures', 'excel_long_indicator_value.xlsx'
        )

        with open(filepath, 'rb') as _file:
            attributes = {
                **self.attributes, **{
                    'date_time_data_type': ImporterTimeDataType.DATA_DRIVEN,
                    'date_time_data_field': 'date_time',
                }
            }
            files = {
                'file': File(_file, name=os.path.basename(_file.name))
            }
            self.importer.save_attributes(attributes, files)

        self.assertImporter(self.importer)

    def test_run_using_admin_type_data(self):
        """Test if correct importer."""
        filepath = ABS_PATH(
            'geosight', 'importer', 'tests', 'importers',
            '_fixtures', 'excel_long_indicator_value.xlsx'
        )

        with open(filepath, 'rb') as _file:
            attributes = {
                **self.attributes, **{
                    'admin_level_type': AdminLevelType.DATA_DRIVEN,
                    'admin_level_field': 'admin_level',
                }
            }
            files = {
                'file': File(_file, name=os.path.basename(_file.name))
            }
            self.importer.save_attributes(attributes, files)

        self.assertImporterLevelByData(self.importer)

    def test_multiple_values_data(self):
        """Test for multiple value data."""
        filepath = ABS_PATH(
            'geosight', 'importer', 'tests', 'importers',
            '_fixtures', 'excel_long_indicator_value (Multiple Value).xlsx'
        )

        # '----------------------------------------------------'
        # Multiple value with count data
        attributes = {
            **self.attributes, **{
                'admin_level_value': 2,
                'aggregate_multiple_value': 'True',
                'aggregate_multiple_value_type':
                    MultipleValueAggregationType.BY_INDICATOR,
            }
        }
        with open(filepath, 'rb') as _file:
            files = {
                'file': File(_file, name=os.path.basename(_file.name))
            }
            self.run_importer(self.importer, attributes, files)

        self.assertIndicatorValueByExcel(filepath, 'COUNT')

        # '----------------------------------------------------'
        # Multiple value with max data
        attributes = {
            **self.attributes, **{
                'admin_level_value': 2,
                'aggregate_multiple_value': 'True',
                'aggregate_multiple_value_type':
                    MultipleValueAggregationType.DEFAULT,
                'aggregate_multiple_value_number': 'MAX(value)'
            }
        }
        with open(filepath, 'rb') as _file:
            files = {
                'file': File(_file, name=os.path.basename(_file.name))
            }
            self.run_importer(self.importer, attributes, files)

        self.assertIndicatorValueByExcel(filepath, 'MAX')

        # '----------------------------------------------------'
        # Multiple value with max data
        attributes = {
            **self.attributes, **{
                'admin_level_value': 2,
                'aggregate_multiple_value': 'True',
                'aggregate_multiple_value_type':
                    MultipleValueAggregationType.DEFAULT,
                'aggregate_multiple_value_number': 'MIN(value)'
            }
        }
        with open(filepath, 'rb') as _file:
            files = {
                'file': File(_file, name=os.path.basename(_file.name))
            }
            self.run_importer(self.importer, attributes, files)

        self.assertIndicatorValueByExcel(filepath, 'MIN')

        # '----------------------------------------------------'
        # Multiple value with max data
        attributes = {
            **self.attributes, **{
                'admin_level_value': 2,
                'aggregate_multiple_value': 'True',
                'aggregate_multiple_value_type':
                    MultipleValueAggregationType.DEFAULT,
                'aggregate_multiple_value_number': 'AVG(value)'
            }
        }
        with open(filepath, 'rb') as _file:
            files = {
                'file': File(_file, name=os.path.basename(_file.name))
            }
            self.run_importer(self.importer, attributes, files)

        self.assertIndicatorValueByExcel(filepath, 'AVG')

    def test_multiple_values_data_string(self):
        """Test for multiple value data."""
        filepath = ABS_PATH(
            'geosight', 'importer', 'tests', 'importers',
            '_fixtures',
            'excel_long_indicator_value (Multiple Value String).xlsx'
        )

        # '----------------------------------------------------'
        # Multiple value with majority data
        attributes = {
            **self.attributes, **{
                'admin_level_value': 2,
                'aggregate_multiple_value': 'True',
                'aggregate_multiple_value_type':
                    MultipleValueAggregationType.DEFAULT,
                'aggregate_multiple_value_string': 'MAJORITY(value)'
            }
        }
        with open(filepath, 'rb') as _file:
            files = {
                'file': File(_file, name=os.path.basename(_file.name))
            }
            self.run_importer(self.importer, attributes, files)

        self.assertIndicatorValueByExcel(filepath, 'MAJORITY')

        # '----------------------------------------------------'
        # Multiple value with minority data
        attributes = {
            **self.attributes, **{
                'admin_level_value': 2,
                'aggregate_multiple_value': 'True',
                'aggregate_multiple_value_type':
                    MultipleValueAggregationType.DEFAULT,
                'aggregate_multiple_value_string': 'MINORITY(value)'
            }
        }
        with open(filepath, 'rb') as _file:
            files = {
                'file': File(_file, name=os.path.basename(_file.name))
            }
            self.run_importer(self.importer, attributes, files)

        self.assertIndicatorValueByExcel(filepath, 'MINORITY')

    def test_aggregate_level_up_to(self):
        """Test for multiple value data."""
        self.indicator_2.max_value = 100
        self.indicator_2.save()
        filepath = ABS_PATH(
            'geosight', 'importer', 'tests', 'importers',
            '_fixtures', 'excel_long_indicator_value (Multiple Value).xlsx'
        )

        # '----------------------------------------------------'
        # Multiple value with count data
        attributes = {
            **self.attributes, **{
                'admin_level_value': 2,
                'aggregate_upper_level_type':
                    MultipleValueAggregationType.BY_INDICATOR,
                'aggregate_upper_level_up_to': -1
            }
        }
        with open(filepath, 'rb') as _file:
            files = {
                'file': File(_file, name=os.path.basename(_file.name))
            }
            self.run_importer(self.importer, attributes, files)

        self.assertIndicatorValueByExcel(filepath, 'COUNT (Upper Level)')

        # Check the description
        country_values = IndicatorValue.objects.filter(
            entity__in=self.reference_layer.entities_set,
            admin_level=0
        )
        for value in country_values:
            self.assertEqual(
                value.attributes,
                {'description': 'COUNT of 9 records (from level 1).'}
            )

        # '----------------------------------------------------'
        # Multiple value with max data
        attributes = {
            **self.attributes, **{
                'admin_level_value': 2,
                'aggregate_upper_level_type':
                    MultipleValueAggregationType.DEFAULT,
                'aggregate_upper_level_up_to': -1,
                'aggregate_upper_level_number': 'MAX(value)'
            }
        }
        with open(filepath, 'rb') as _file:
            files = {
                'file': File(_file, name=os.path.basename(_file.name))
            }
            self.run_importer(self.importer, attributes, files)

        self.assertIndicatorValueByExcel(filepath, 'MAX (Upper Level)')

        # Check the description
        country_values = IndicatorValue.objects.filter(
            entity__in=self.reference_layer.entities_set,
            admin_level=0
        )
        for value in country_values:
            self.assertEqual(
                value.attributes,
                {'description': 'MAX of 9 records (from level 1).'}
            )

        # '----------------------------------------------------'
        # Multiple value with min data
        attributes = {
            **self.attributes, **{
                'admin_level_value': 2,
                'aggregate_upper_level_type':
                    MultipleValueAggregationType.DEFAULT,
                'aggregate_upper_level_up_to': -1,
                'aggregate_upper_level_number': 'MIN(value)'
            }
        }
        with open(filepath, 'rb') as _file:
            files = {
                'file': File(_file, name=os.path.basename(_file.name))
            }
            self.run_importer(self.importer, attributes, files)

        self.assertIndicatorValueByExcel(filepath, 'MIN (Upper Level)')

        # Check the description
        country_values = IndicatorValue.objects.filter(
            entity__in=self.reference_layer.entities_set,
            admin_level=0
        )
        for value in country_values:
            self.assertEqual(
                value.attributes,
                {'description': 'MIN of 9 records (from level 1).'}
            )

        # '----------------------------------------------------'
        # Multiple value with avg data
        attributes = {
            **self.attributes, **{
                'admin_level_value': 2,
                'aggregate_upper_level_type':
                    MultipleValueAggregationType.DEFAULT,
                'aggregate_upper_level_up_to': -1,
                'aggregate_upper_level_number': 'AVG(value)'
            }
        }
        with open(filepath, 'rb') as _file:
            files = {
                'file': File(_file, name=os.path.basename(_file.name))
            }
            self.run_importer(self.importer, attributes, files)

        self.assertIndicatorValueByExcel(filepath, 'AVG (Upper Level)')
        self.indicator_2.max_value = 7
        self.indicator_2.save()

        # Check the description
        country_values = IndicatorValue.objects.filter(
            entity__in=self.reference_layer.entities_set,
            admin_level=0
        )
        for value in country_values:
            self.assertEqual(
                value.attributes,
                {'description': 'AVG of 9 records (from level 1).'}
            )
