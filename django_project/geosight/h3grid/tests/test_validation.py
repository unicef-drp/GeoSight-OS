"""Tests for H3 cell validation"""

from unittest import TestCase

import h3

from geosight.h3grid.validation import (
    H3Error, normalize_cell, resolutions_present, validate_column,
)


class H3ValidationTest(TestCase):
    """Check cell stripping/normalization and column error reporting."""

    def setUp(self):
        self.cell = h3.latlng_to_cell(0, 0, 5)

    def test_normalize_strips(self):
        self.assertEqual(normalize_cell(f'  {self.cell.upper()}  '), self.cell)

    def test_normalize_invalids(self):
        for value in (None, 123, '', '   ', 'asas-hjhg-jhk'):
            with self.subTest(value=value):
                with self.assertRaises(H3Error):
                    normalize_cell(value)

    def test_columns_reportsall(self):
        other_cell = h3.latlng_to_cell(1, 1, 6)
        values = [f' {self.cell.upper()} ', None, 'bad', other_cell, ' ']

        valid_ids, errors = validate_column(values)

        self.assertEqual(valid_ids, [self.cell, other_cell])
        self.assertEqual([error['row'] for error in errors], [3, 4, 6])
        self.assertEqual([error['value'] for error in errors], [None, 'bad', ' '])
        self.assertTrue(all(error['message'] for error in errors))

    def test_resolutions_sorts(self):
        fine_cell = h3.latlng_to_cell(0, 0, 8)

        self.assertEqual(
            resolutions_present([fine_cell, self.cell, self.cell.upper()]),
            [5, 8],
        )
        self.assertEqual(resolutions_present([]), [])
