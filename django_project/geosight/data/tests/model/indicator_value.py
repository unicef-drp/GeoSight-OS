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

from core.tests.base_tests import TestCase
from geosight.data.tests.model_factories import (
    IndicatorValueF, IndicatorF
)


class IndicatorValueTest(TestCase):
    """Test for IndicatorValue model.

    Focus for flat table.
    """

    def setUp(self):
        """To setup test."""
        self.name = 'Rule 1'
        self.indicator_name = 'Indicator 1'

    def test_create(self):
        """Test create."""
        indicator = IndicatorF(name=self.indicator_name)
        value = IndicatorValueF(
            indicator=indicator,
            geom_id='Prov1'
        )
        self.assertEquals(value.indicator, indicator)
        self.assertEquals(value.geom_id, 'Prov1')
