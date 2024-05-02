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

from core.tests.base_tests import TenantTestCase as TestCase

from geosight.data.tests.model_factories import IndicatorRuleF, IndicatorF


class IndicatorRuleTest(TestCase):
    """Test for IndicatorRule model."""

    def setUp(self):
        """To setup test."""
        self.name = 'Indicator Rule 1'
        self.indicator_name = 'Indicator 1'

    def test_create(self):
        """Test create."""
        indicator = IndicatorF(name=self.indicator_name)
        indicator_rule = IndicatorRuleF(
            name=self.name,
            indicator=indicator
        )
        self.assertEquals(indicator_rule.name, self.name)
        self.assertEquals(indicator_rule.indicator, indicator)
