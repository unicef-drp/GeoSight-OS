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

from core.models.profile import ROLES
from core.tests.model_factories import create_user
from geosight.data.models.related_table import RelatedTable
from geosight.importer.exception import ImporterDoesNotExist
from geosight.importer.importers import RelatedTableSharepointExcelWideFormat
from geosight.importer.models import Importer, ImportType, InputFormat
from geosight.importer.models.log import LogStatus
from ._base import BaseSharepointIndicatorValueTest


class SharepointWideFormatRelatedTableTest(BaseSharepointIndicatorValueTest):
    """Test for Importer : Sharepoint Wide Format Related Table."""

    def setUp(self):
        """To setup tests."""
        super().setUp()
        self.creator = create_user(ROLES.CREATOR.name)
        self.importer = Importer.objects.create(
            import_type=ImportType.RELATED_TABLE,
            input_format=InputFormat.SHAREPOINT_EXCEL_WIDE,
            creator=self.creator
        )

    def test_error_importer(self):
        """Test if correct importer."""
        with self.assertRaises(ImporterDoesNotExist):
            Importer.objects.create(
                import_type=ImportType.RELATED_TABLE,
                input_format='test',
                reference_layer=self.reference_layer
            )

    def test_correct_importer(self):
        """Test if correct importer."""
        self.assertEqual(
            self.importer.importer, RelatedTableSharepointExcelWideFormat
        )

    def test_run(self):
        """Test if correct importer."""
        attributes = {
            **self.attributes,
            **{
                'sharepoint_relative_path':
                    'excel_wide_related_table.xlsx',
                'related_table_name': 'Related Table A',
                'sheet_name': 'Sheet 1',
                'row_number_for_header': 1
            }
        }
        self.importer.save_attributes(attributes, {})
        self.importer.run()

        self.assertEqual(
            self.importer.importerlog_set.all().first().status,
            LogStatus.SUCCESS
        )

        related_table = RelatedTable.objects.get(name='Related Table A')
        self.assertEqual(related_table.relatedtablerow_set.count(), 9)
        first_row = related_table.relatedtablerow_set.first()
        self.assertEqual(len(first_row.data.keys()), 5)
        self.assertEqual(first_row.data['Population'], 1)
        self.assertEqual(first_row.data['geom_code'], 'A')

    def test_run_replace(self):
        """Test if correct importer."""
        self.test_run()
        related_table = RelatedTable.objects.get(name='Related Table A')
        attributes = {
            **self.attributes,
            **{
                'sharepoint_relative_path':
                    'excel_wide_related_table_2.xlsx',
                'related_table_uuid': related_table.unique_id,
                'related_table_name': 'Related Table B',
                'sheet_name': 'Sheet 1',
                'row_number_for_header': 1
            }
        }
        self.importer.save_attributes(attributes, {})
        self.importer.run()

        self.assertEqual(
            self.importer.importerlog_set.all().first().status,
            LogStatus.SUCCESS
        )

        related_table = RelatedTable.objects.get(name='Related Table B')
        self.assertEqual(RelatedTable.objects.count(), 1)
        self.assertEqual(related_table.relatedtablerow_set.count(), 9)
        first_row = related_table.relatedtablerow_set.first()
        self.assertEqual(len(first_row.data.keys()), 5)
        self.assertEqual(first_row.data['Population'], 1)
        self.assertEqual(first_row.data['geom_code'], 'D')
