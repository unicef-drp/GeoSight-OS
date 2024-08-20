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

from core.tests.base_tests import TestCase

from geosight.data.models.dashboard import Dashboard, DashboardRelatedTable
from geosight.data.models.related_table import (
    RelatedTable
)
from geosight.data.serializer.related_table import RelatedTableSerializer


class RelatedTableTest(TestCase):
    """Test for RelatedTable model."""

    def setUp(self):
        """To setup test."""
        self.related_table = RelatedTable.objects.create(name='Test')
        self.dashboard = Dashboard.objects.create(name='Test')

    def test_insert_row(self):
        """Test insert row."""
        data = {
            'geom_id': 'Geom1',
            'Field 1': 'Field 1',
            'Field 2': 'Field 2',
        }
        self.related_table.insert_row(data)
        rows = RelatedTableSerializer(self.related_table).data['rows']
        self.assertEqual(len(rows), 1)
        for key, value in data.items():
            self.assertEqual(rows[0][key], value)

        self.related_table.set_fields()
        fields_definition = self.related_table.fields_definition
        self.assertEqual(fields_definition[0]['name'], 'Field 1')
        self.assertEqual(fields_definition[1]['name'], 'Field 2')
        self.assertEqual(fields_definition[2]['name'], 'geom_id')

    def test_insert_row_with_replace(self):
        """Test insert row."""
        # Create original data
        data = {
            'geom_id': 'Geom1',
            'Field 1': 'Field 1',
            'Field 2': 'Field 2',
        }
        self.related_table.insert_row(data)

        # insert new data
        data = {
            'order': 0,
            'geom_id': 'Geom2',
            'Field 1': 'Field 1.1',
            'Field 2': 'Field 2.1',
        }

        self.related_table.insert_row(data, replace=True)
        rows = RelatedTableSerializer(self.related_table).data['rows']
        self.assertEqual(len(rows), 1)
        for key, value in data.items():
            self.assertEqual(rows[0][key], value)

    def test_insert_row_with_id(self):
        """Test insert row."""
        # Create original data
        data = {
            'geom_id': 'Geom1',
            'Field 1': 'Field 1',
            'Field 2': 'Field 2',
        }
        row = self.related_table.insert_row(data)

        # insert new data
        data = {
            'geom_id': 'Geom2',
            'Field 1': 'Field 1.1',
            'Field 2': 'Field 2.1',
        }

        self.related_table.insert_row(data, row_id=row.id)
        rows = RelatedTableSerializer(self.related_table).data['rows']
        self.assertEqual(len(rows), 1)
        for key, value in data.items():
            self.assertEqual(rows[0][key], value)

    def test_insert_rows(self):
        """Test insert rows."""
        list_data = [
            {
                'geom_id': 'Geom1',
                'Field 1': 'Field 1.1',
                'Field 2': 'Field 2.1',
            },
            {
                'geom_id': 'Geom2',
                'Field 1': 'Field 1.1',
                'Field 2': 'Field 2.1',
            }
        ]
        self.related_table.insert_rows(list_data)
        rows = RelatedTableSerializer(self.related_table).data['rows']
        self.assertEqual(len(rows), len(list_data))
        for idx, data in enumerate(list_data):
            for key, value in data.items():
                self.assertEqual(rows[idx][key], value)

    def test_insert_rows_with_replace(self):
        """Test insert rows."""
        # Create original data
        list_data = [
            {
                'geom_id': 'Geom1',
                'Field 1': 'Field 1.1',
                'Field 2': 'Field 2.1',
            },
            {
                'geom_id': 'Geom2',
                'Field 1': 'Field 1.1',
                'Field 2': 'Field 2.1',
            }
        ]
        self.related_table.insert_rows(list_data)

        # insert new data
        list_data = [
            {
                'order': 0,
                'geom_id': 'Geom10',
                'Field 1': 'Field 1.2',
                'Field 2': 'Field 2.2',
            },
            {
                'order': 1,
                'geom_id': 'Geom20',
                'Field 1': 'Field 1.3',
                'Field 2': 'Field 2.3',
            }
        ]
        self.related_table.insert_rows(list_data, replace=True)
        rows = RelatedTableSerializer(self.related_table).data['rows']
        self.assertEqual(len(rows), len(list_data))
        for idx, data in enumerate(list_data):
            for key, value in data.items():
                self.assertEqual(rows[idx][key], value)

    def test_intergration(self):
        """Test intergration related table."""
        data = [
            {
                'geom_id': 'Geom1',
                'Field 1': 'Field 1',
                'Field 2': 'Field 2',
            }
        ]
        related_table = RelatedTable.objects.create(name='Test 2')
        related_table.insert_rows(data)
        DashboardRelatedTable.objects.create(
            dashboard=self.dashboard,
            object=related_table,
            geography_code_field_name='geom_id',
            selected_related_fields=['geom_id', 'Field 1', 'Field 2']
        )
        self.assertEqual(
            DashboardRelatedTable.objects.filter(object=related_table).count(),
            1
        )
        data = [
            {
                'geom_id': 'Geom1',
                'Field 1': 'Field 1',
            }
        ]
        related_table.insert_rows(data, replace=True)
        related_table.check_relation()
        dashboard_rt = DashboardRelatedTable.objects.get(object=related_table)
        self.assertTrue('Field 1' in dashboard_rt.selected_related_fields)
        self.assertTrue('Field 2' not in dashboard_rt.selected_related_fields)

        data = [
            {
                'Field 1': 'Field 1',
                'Field 2': 'Field 2',
            }
        ]
        related_table.insert_rows(data, replace=True)
        related_table.check_relation()
        self.assertEqual(
            DashboardRelatedTable.objects.filter(
                object=self.related_table).count(), 0
        )
