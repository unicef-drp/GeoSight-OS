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

from core.settings.utils import ABS_PATH
from geosight.data.models.indicator import IndicatorType
from geosight.data.tests.model_factories import RelatedTableF
from geosight.importer.importers.base.indicator_value import (
    ImporterTimeDataType, IndicatorDataType, AdminLevelType
)
from geosight.importer.importers.query_data import Aggregations
from geosight.importer.models import Importer, ImportType, InputFormat
from geosight.importer.tests.importers._base import (
    BaseIndicatorValueImporterTest
)
from geosight.importer.utilities import json_from_excel


class BaseTest(BaseIndicatorValueImporterTest):
    """Base for Api Importer."""

    default_date = '2010-01-01'

    arcgis_test_url = 'http://arcgis_test.com'
    attributes = {
        'indicator_data_type': IndicatorDataType.BY_VALUE,
        'date_time_data_type': ImporterTimeDataType.BY_VALUE,
        'date_time_data_value': default_date,
        'admin_level_type': AdminLevelType.BY_VALUE,
        'geometry_type': 'Point',
        'aggregation': Aggregations.COUNT,
        'key_administration_code': 'geom_code',
        'key_value': 'value',
    }
    fixture = ABS_PATH(
        'geosight', 'importer', 'tests', 'importers',
        'related_table', '_fixtures', 'excel_long_indicator_value.xlsx'
    )

    def setUp(self):
        """To setup tests."""
        self.related_table = RelatedTableF()
        super().setUp()
        self.attributes['related_table_id'] = self.related_table.id
        self.attributes['admin_level_value'] = self.admin_level
        self.attributes['indicator_data_value'] = self.indicator.id

        data = json_from_excel(self.fixture, sheet_name='Sheet 1')
        self.related_table.insert_rows(data, replace=True)
        self.importer = Importer.objects.create(
            import_type=ImportType.INDICATOR_VALUE,
            input_format=InputFormat.RELATED_TABLE_LAYER,
            reference_layer=self.reference_layer
        )
        self.reference_layer_identifier = self.reference_layer.identifier
        self.indicator_1.type = IndicatorType.FLOAT
        self.indicator_1.save()
        self.indicator_2.type = IndicatorType.FLOAT
        self.indicator_2.save()

    def run_importer(self, attributes):
        """Run Importer with new attribute."""
        self.importer.save_attributes(
            {
                **self.attributes,
                **attributes
            },
            {}
        )
        self.importer.run()
        log = self.importer.importerlog_set.all().last()
        self.assertTrue(log.status in ['Success', 'Warning'])
