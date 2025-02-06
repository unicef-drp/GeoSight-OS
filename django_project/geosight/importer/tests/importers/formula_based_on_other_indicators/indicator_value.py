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
__date__ = '06/07/2023'
__copyright__ = ('Copyright 2023, Unicef')

from geosight.importer.exception import ImporterDoesNotExist
from geosight.importer.importers.base.indicator_value import (
    ImporterTimeDataType
)
from geosight.importer.importers.formula_based_on_other_indicators import (
    FormulaBasedOnOtherIndicatorsIndicatorValue
)
from geosight.importer.models import Importer, ImportType
from geosight.importer.models.log import LogStatus
from .base import (
    BaseTest, expression_1, expression_2, expression_3, expression_4
)


class FormulaBasedOnOtherIndicatorsIndicatorValueTest(BaseTest):
    """Test for Importer : FormulaBasedOnOtherIndicators Indicator Value."""

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
        self.assertEqual(
            self.importer.importer,
            FormulaBasedOnOtherIndicatorsIndicatorValue
        )

    def test_run_error_attributes(self):
        """Test if error attributes importer."""
        # by value but no date value
        attributes = {
            **self.attributes, **{
                'date_time_data_type': ImporterTimeDataType.BY_VALUE,
                'date_time_data_value': None,
                'selected_indicators': '[]',
                'expression': '',
            }
        }
        self.importer.save_attributes(attributes, {})

        self.importer.run()
        self.assertEqual(
            self.importer.importerlog_set.all().first().status,
            LogStatus.FAILED
        )

        # data driven but no data value
        attributes = {
            **self.attributes, **{
                'date_time_data_type': ImporterTimeDataType.DATA_DRIVEN,
                'selected_indicators': '[]',
                'expression': '',
            }
        }
        self.importer.save_attributes(attributes, {})
        self.importer.run()

        self.assertEqual(
            self.importer.importerlog_set.all().first().status,
            LogStatus.FAILED
        )

    def test_expression_1(self):
        """Test expression is sum of all value."""
        # by value but no date value
        attributes = {
            **self.attributes,
            **{
                'selected_indicators': self.indicators,
                'expression': expression_1
            }
        }
        self.importer.save_attributes(attributes, {})

        self.importer.run()
        self.assertEqual(
            self.importer.importerlog_set.all().first().status,
            LogStatus.SUCCESS
        )

        for value in self.indicator.indicatorvalue_set.all():
            self.assertEqual(
                value.value,
                self.values_expression_1[
                    value.geom_id][value.date.strftime('%Y-%m-%d')]
            )
            self.assertEqual(value.indicator, self.indicator)
            entity = self.reference_layer.entities_set.get(
                geom_id=value.geom_id,
                admin_level=self.admin_level
            )
            self.assertEqual(entity, value.entity)
            self.assertEqual(entity.reference_layer, self.reference_layer)
            self.assertEqual(entity.admin_level, self.admin_level)
            self.assertEqual(entity.geom_id, value.geom_id)

    def test_expression_2(self):
        """Test expression of times of values."""
        # by value but no date value
        attributes = {
            **self.attributes,
            **{
                'selected_indicators': self.indicators,
                'expression': expression_2
            }
        }
        self.importer.save_attributes(attributes, {})

        self.importer.run()
        self.assertEqual(
            self.importer.importerlog_set.all().first().status,
            LogStatus.SUCCESS
        )

        for value in self.indicator.indicatorvalue_set.all():
            self.assertEqual(
                value.value,
                self.values_expression_2[
                    value.geom_id][value.date.strftime('%Y-%m-%d')]
            )
            self.assertEqual(value.indicator, self.indicator)
            entity = self.reference_layer.entities_set.get(
                geom_id=value.geom_id,
                admin_level=self.admin_level
            )
            self.assertEqual(entity.reference_layer, self.reference_layer)
            self.assertEqual(entity.admin_level, self.admin_level)
            self.assertEqual(entity.geom_id, value.geom_id)

    def test_expression_3(self):
        """Test expression using filter."""
        # by value but no date value
        attributes = {
            **self.attributes,
            **{
                'selected_indicators': self.indicators,
                'expression': expression_3
            }
        }
        self.importer.save_attributes(attributes, {})

        self.importer.run()
        self.assertEqual(
            self.importer.importerlog_set.all().first().status,
            LogStatus.SUCCESS
        )

        for value in self.indicator.indicatorvalue_set.all():
            self.assertEqual(
                value.value,
                self.values_expression_3[
                    value.geom_id][value.date.strftime('%Y-%m-%d')]
            )
            self.assertEqual(value.indicator, self.indicator)
            entity = self.reference_layer.entities_set.get(
                geom_id=value.geom_id,
                admin_level=self.admin_level
            )
            self.assertEqual(entity.reference_layer, self.reference_layer)
            self.assertEqual(entity.admin_level, self.admin_level)
            self.assertEqual(entity.geom_id, value.geom_id)

    def test_expression_4(self):
        """Test expression using avg."""
        # by value but no date value
        attributes = {
            **self.attributes,
            **{
                'selected_indicators': self.indicators,
                'expression': expression_4
            }
        }
        self.importer.save_attributes(attributes, {})

        self.importer.run()
        self.assertEqual(
            self.importer.importerlog_set.all().first().status,
            LogStatus.SUCCESS
        )

        for value in self.indicator.indicatorvalue_set.all():
            self.assertEqual(
                value.value,
                self.values_expression_4[
                    value.geom_id][value.date.strftime('%Y-%m-%d')]
            )
            self.assertEqual(value.indicator, self.indicator)
            entity = self.reference_layer.entities_set.get(
                geom_id=value.geom_id,
                admin_level=self.admin_level
            )
            self.assertEqual(entity.reference_layer, self.reference_layer)
            self.assertEqual(entity.admin_level, self.admin_level)
            self.assertEqual(entity.geom_id, value.geom_id)
