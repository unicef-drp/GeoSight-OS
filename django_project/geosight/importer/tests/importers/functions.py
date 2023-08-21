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

from datetime import datetime, date

from django.test.testcases import TestCase

from geosight.importer.importers.base.indicator_value import \
    AbstractImporterIndicatorValue, ImporterTimeDataType
from geosight.importer.models import (
    Importer, ImportType, InputFormat, ImporterLog
)


class ImporterFunctionsTest(TestCase):
    """Base for Importer."""

    def test_get_date_time(self):
        """Test if error attributes importer."""
        importer = Importer.objects.create(
            import_type=ImportType.INDICATOR_VALUE,
            input_format=InputFormat.SDMX,
            reference_layer=None
        )
        attributes = {
            'url': '',
            'key_administration_code': '',
            'admin_level_type': '',
            'indicator_data_type': '',
            'key_value': '',
            'date_time_data_type': ImporterTimeDataType.DATA_DRIVEN
        }
        importer.save_attributes(attributes, {})
        log = ImporterLog.objects.create(importer=importer)

        # If no date_time_data_field
        importer_obj = AbstractImporterIndicatorValue(log)
        date_time, error = importer_obj.get_date_time({})
        self.assertEqual(error, 'Date time column/field is required')

        attributes['date_time_data_field'] = 'date_time'
        importer.save_attributes(attributes, {})

        importer_obj = AbstractImporterIndicatorValue(log)

        # If using date
        now = date.today()
        date_time, error = importer_obj.get_date_time({'date_time': now})
        self.assertEqual(
            date_time, datetime.combine(now, datetime.min.time())
        )
        # If using datetime
        now = datetime.now()
        date_time, error = importer_obj.get_date_time({'date_time': now})
        self.assertEqual(date_time, now)

        # If timestamp
        full_format = '%Y-%m-%d %H:%M:%S'
        now = datetime.today()
        date_time, error = importer_obj.get_date_time(
            {'date_time': datetime.timestamp(now)}
        )
        self.assertEqual(
            date_time.strftime(full_format), now.strftime(full_format)
        )

        # If %Y-%m-%d %H:%M:%S
        attributes['date_time_data_format'] = '%Y-%m-%dT%H:%M:%S'
        importer.save_attributes(attributes, {})
        importer_obj = AbstractImporterIndicatorValue(log)
        date_time, error = importer_obj.get_date_time({'date_time': '2023'})
        self.assertEqual(
            error, 'Date is not in YYYY-MM-DDTHH:MM:SS format'
        )
        date_time, error = importer_obj.get_date_time(
            {'date_time': '2023-01-01T00:00:00.000Z'}
        )
        self.assertEqual(
            date_time.strftime(full_format), '2023-01-01 00:00:00'
        )

        # If %Y
        attributes['date_time_data_format'] = '%Y'
        importer.save_attributes(attributes, {})
        importer_obj = AbstractImporterIndicatorValue(log)
        date_time, error = importer_obj.get_date_time(
            {'date_time': '2023-01-01'}
        )
        self.assertEqual(
            error, 'Date is not in YYYY format'
        )
        date_time, error = importer_obj.get_date_time({'date_time': '2023'})
        self.assertEqual(
            date_time.strftime(full_format), '2023-01-01 00:00:00'
        )

        # If %Y-%m-%d
        attributes['date_time_data_format'] = '%Y-%m-%d'
        importer.save_attributes(attributes, {})
        importer_obj = AbstractImporterIndicatorValue(log)
        date_time, error = importer_obj.get_date_time({'date_time': '2023'})
        self.assertEqual(
            'Date is not in YYYY-MM-DD format', error
        )
        date_time, error = importer_obj.get_date_time(
            {'date_time': '2023-01-01'}
        )
        self.assertEqual(
            date_time.strftime(full_format), '2023-01-01 00:00:00'
        )

        # If %Y-%m-%d
        attributes['date_time_data_format'] = '%Y-%m'
        importer.save_attributes(attributes, {})
        importer_obj = AbstractImporterIndicatorValue(log)
        date_time, error = importer_obj.get_date_time(
            {'date_time': '2023-01-01'}
        )
        self.assertEqual(error, 'Date is not in YYYY-MM format')
        date_time, error = importer_obj.get_date_time(
            {'date_time': '2023-01'}
        )
        self.assertEqual(
            date_time.strftime(full_format), '2023-01-01 00:00:00'
        )
