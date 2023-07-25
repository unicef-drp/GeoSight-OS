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

import responses

from geosight.importer.exception import ImporterDoesNotExist
from geosight.importer.importers.base.indicator_value import (
    ImporterTimeDataType
)
from geosight.importer.importers.query_data import Aggregations
from geosight.importer.importers.vector_context_layer.base import (
    VectorContextLayerIndicatorValue, SpatialMethod
)
from geosight.importer.models import Importer, ImportType
from geosight.importer.models.log import LogStatus
from .base import BaseTest


class VectorContextLayerIndicatorValueTest(BaseTest):
    """Test for Importer : Vector Context Layer Format Indicator Value."""

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
            self.importer.importer, VectorContextLayerIndicatorValue
        )

    def test_run_error_attributes(self):
        """Test if error attributes importer."""
        # by value but no date value
        attributes = {
            **self.attributes, **{
                'date_time_data_type': ImporterTimeDataType.BY_VALUE,
                'date_time_data_value': None
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
                'date_time_data_type': ImporterTimeDataType.DATA_DRIVEN
            }
        }
        self.importer.save_attributes(attributes, {})
        self.importer.run()

        self.assertEqual(
            self.importer.importerlog_set.all().first().status,
            LogStatus.FAILED
        )

    @responses.activate
    def test_intersect_count(self):
        """Test the harvester intersect and count."""
        self.assert_results(
            values={'AA': 3, 'BB': 2, 'CC': 2, 'ZZ': 0},
            filter='',
            statial_method=SpatialMethod.INTERSECT,
            aggregation_method=Aggregations.COUNT
        )

    @responses.activate
    def test_intersect_max(self):
        """Test the harvester intersect and max."""
        self.assert_results(
            values={'AA': 20, 'BB': 15, 'CC': 15, 'ZZ': 0},
            filter='',
            statial_method=SpatialMethod.INTERSECT,
            aggregation_method=Aggregations.MAX + '(population)'
        )

    @responses.activate
    def test_intersect_min(self):
        """Test the harvester intersect and min."""
        self.assert_results(
            values={'AA': 10, 'BB': 10, 'CC': 5, 'ZZ': 0},
            filter='',
            statial_method=SpatialMethod.INTERSECT,
            aggregation_method=Aggregations.MIN + '(population)'
        )

    @responses.activate
    def test_intersect_avg(self):
        """Test the harvester intersect and average."""
        self.assert_results(
            values={'AA': 15, 'BB': 12.5, 'CC': 10, 'ZZ': 0},
            filter='',
            statial_method=SpatialMethod.INTERSECT,
            aggregation_method=Aggregations.AVG + '(population)'
        )

    @responses.activate
    def test_intersect_count_filter(self):
        """Test the harvester intersect, count and filter."""
        # filter 1
        self.assert_results(
            values={'AA': 2, 'BB': 1, 'CC': 1, 'ZZ': 0},
            filter='population>10',
            statial_method=SpatialMethod.INTERSECT,
            aggregation_method=Aggregations.COUNT
        )
        self.assert_results(
            values={'AA': 2, 'BB': 2, 'CC': 2, 'ZZ': 0},
            filter='population>10 OR male>2',
            statial_method=SpatialMethod.INTERSECT,
            aggregation_method=Aggregations.COUNT
        )
        self.assert_results(
            values={'AA': 2, 'BB': 1, 'CC': 2, 'ZZ': 0},
            filter='population > 10 OR (male > 2 AND population <= 5)',
            statial_method=SpatialMethod.INTERSECT,
            aggregation_method=Aggregations.COUNT
        )
