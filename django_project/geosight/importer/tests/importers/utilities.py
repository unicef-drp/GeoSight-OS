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
__date__ = '02/04/2024'
__copyright__ = ('Copyright 2023, Unicef')

from core.tests.base_tests import TenantTestCase as TestCase

from geosight.importer.utilities import get_data_from_record, ImporterError


class ImporterUtilitiesTest(TestCase):
    """Base for Importer."""

    def test_get_data_from_record(self):
        """Test get_data_from_record."""
        record = {
            'a': 'a',
            'b': 'b',
            'b.b': 'b.b',
            'c': {
                'd': 'd',
                'e': {
                    'f': 'f'
                }
            }
        }

        # Check if not required
        self.assertEqual(
            get_data_from_record('a', record, required=False), 'a'
        )
        self.assertEqual(
            get_data_from_record('b.b', record, required=False), 'b.b'
        )
        self.assertEqual(
            get_data_from_record('c.d', record, required=False), 'd'
        )
        self.assertEqual(
            get_data_from_record('aa', record, required=False), None
        )

        # Check if required
        self.assertEqual(
            get_data_from_record('a', record, required=True), 'a'
        )
        self.assertEqual(
            get_data_from_record('b.b', record, required=True), 'b.b'
        )
        self.assertEqual(
            get_data_from_record('c.d', record, required=True), 'd'
        )
        with self.assertRaises(ImporterError):
            get_data_from_record('aa', record, required=True)
