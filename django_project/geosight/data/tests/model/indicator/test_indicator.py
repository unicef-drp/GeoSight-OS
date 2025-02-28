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

from core.tests.base_tests import TestCase
from geosight.data.models.indicator.indicator import Indicator
from geosight.data.tests.model_factories import (
    IndicatorF, IndicatorGroupF, IndicatorRuleF
)


class IndicatorTest(TestCase):
    """.Test for Indicator model."""

    def setUp(self):
        """To setup test."""
        self.name = 'Indicator 1'

    def test_create(self):
        """Test create."""
        group = IndicatorGroupF()

        indicator = IndicatorF(
            name=self.name,
            group=group
        )
        self.assertEquals(indicator.name, self.name)
        self.assertEquals(indicator.group, group)

    def test_list(self):
        """Test list method."""
        group = IndicatorGroupF()
        IndicatorF(name='Name 1', group=group)
        IndicatorF(name='Name 2', group=group)
        self.assertEquals(Indicator.objects.count(), 2)

    def test_rules(self):
        """Check rules."""
        indicator = IndicatorF(
            name='Name 1',
            group=IndicatorGroupF()
        )
        rules = [
            IndicatorRuleF(indicator=indicator, rule='x==1'),
            IndicatorRuleF(indicator=indicator, rule='x==2 or x==3'),
            IndicatorRuleF(indicator=indicator, rule='x>=4 and x<=5'),
            IndicatorRuleF(indicator=indicator, rule='x>5'),
            IndicatorRuleF(indicator=indicator, rule='x<5')
        ]
        for rule in rules:
            found = False
            color = ''
            for indicator_rule in indicator.rules_dict():
                if indicator_rule['name'] == rule.name:
                    found = True
                    color = indicator_rule['color']
            self.assertTrue(found)
            self.assertEquals(
                rule.color,
                color
            )

    @patch.object(
        Indicator, 'update_indicator_value_data', autospec=True
    )
    def test_check_update_indicator_value_data(self, mock_func):
        """Check update indicator value function being called.

        Should be just when the indicator name is updated.
        """
        indicator = IndicatorF(
            name='Name 1',
            group=IndicatorGroupF()
        )
        self.assertEqual(mock_func.call_count, 0)
        indicator.shortcode = 'shortcode'
        indicator.save()
        self.assertEqual(mock_func.call_count, 0)
        indicator.unit = 'm'
        indicator.save()
        self.assertEqual(mock_func.call_count, 0)
        indicator.name = 'Name 2'
        indicator.save()
        self.assertEqual(mock_func.call_count, 1)
        indicator.name = 'Name 1'
        indicator.save()
        self.assertEqual(mock_func.call_count, 2)
        indicator.unit = 'm'
        indicator.save()
        self.assertEqual(mock_func.call_count, 2)
