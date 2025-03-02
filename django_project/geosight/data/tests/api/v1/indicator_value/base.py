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
__date__ = '02/03/2025'
__copyright__ = ('Copyright 2023, Unicef')

from datetime import datetime

from geosight.data.models import Indicator, IndicatorType
from geosight.data.tests.model_factories import (
    IndicatorF
)
from geosight.georepo.models import (
    ReferenceLayerView
)
from geosight.georepo.request.data import GeorepoEntity
from geosight.georepo.tests.model_factories.reference_layer import (
    ReferenceLayerF
)
from geosight.permission.models.factory import PERMISSIONS
from geosight.permission.tests._base import BasePermissionTest


class BaseDataBrowserTest(object):
    """Base data browser."""

    class TestCase(BasePermissionTest.TestCase):
        """Test for data browser."""

        def setUp(self):
            """To setup test."""
            # Create the entities
            self.ref_1 = ReferenceLayerF()
            self.country_1, _ = GeorepoEntity(
                {
                    'name': 'name',
                    'ucode': '1',
                    'admin_level': 0
                }
            ).get_or_create(self.ref_1)
            GeorepoEntity(
                {
                    'name': 'name',
                    'ucode': 'A',
                    'admin_level': 1,
                    'parents': [
                        {'ucode': '1', 'admin_level': 0},
                    ]
                }
            ).get_or_create(self.ref_1)
            GeorepoEntity(
                {
                    'name': 'name',
                    'ucode': 'B',
                    'admin_level': 1,
                    'parents': [
                        {'ucode': '1', 'admin_level': 0},
                    ]
                }
            ).get_or_create(self.ref_1)
            GeorepoEntity(
                {
                    'name': 'name',
                    'ucode': 'C',
                    'admin_level': 1,
                    'parents': [
                        {'ucode': '1', 'admin_level': 0},
                    ]
                }
            ).get_or_create(self.ref_1)

            self.entity, _ = GeorepoEntity(
                {
                    'name': 'name',
                    'ucode': 'AA',
                    'admin_level': 2,
                    'parents': [
                        {'ucode': '1', 'admin_level': 0},
                        {'ucode': 'A', 'admin_level': 1},
                    ]
                }
            ).get_or_create(self.ref_1)

            GeorepoEntity(
                {
                    'name': 'name',
                    'ucode': 'BA',
                    'admin_level': 2,
                    'parents': [
                        {'ucode': '1', 'admin_level': 0},
                        {'ucode': 'B', 'admin_level': 1},
                    ]
                }
            ).get_or_create(self.ref_1)

            # Other entities
            self.ref_2 = ReferenceLayerF()
            self.country_2, _ = GeorepoEntity(
                {
                    'name': 'name',
                    'ucode': '2',
                    'admin_level': 0
                }
            ).get_or_create(self.ref_1)
            GeorepoEntity(
                {
                    'name': 'name',
                    'ucode': 'E',
                    'admin_level': 1,
                    'parents': [
                        {'ucode': '2', 'admin_level': 0},
                    ]
                }
            ).get_or_create(self.ref_2)
            GeorepoEntity(
                {
                    'name': 'name',
                    'ucode': 'F',
                    'admin_level': 1,
                    'parents': [
                        {'ucode': '2', 'admin_level': 0},
                    ]
                }
            ).get_or_create(self.ref_2)
            GeorepoEntity(
                {
                    'name': 'name',
                    'ucode': 'G',
                    'admin_level': 1,
                    'parents': [
                        {'ucode': '2', 'admin_level': 0},
                    ]
                }
            ).get_or_create(self.ref_2)
            GeorepoEntity(
                {
                    'name': 'name',
                    'ucode': 'EA',
                    'admin_level': 2,
                    'parents': [
                        {'ucode': '2', 'admin_level': 0},
                        {'ucode': 'E', 'admin_level': 1},
                    ]
                }
            ).get_or_create(self.ref_1)
            GeorepoEntity(
                {
                    'name': 'name',
                    'ucode': 'FA',
                    'admin_level': 2,
                    'parents': [
                        {'ucode': '2', 'admin_level': 0},
                        {'ucode': 'F', 'admin_level': 1},
                    ]
                }
            ).get_or_create(self.ref_1)

            super(BaseDataBrowserTest.TestCase, self).setUp()
            self.indicator_1 = IndicatorF(
                name='name_1',
                creator=self.creator,
                type=IndicatorType.INTEGER
            )
            self.indicator_2 = IndicatorF(
                name='name_1',
                creator=self.creator_in_group
            )

            # Reference layer indicators
            permission = self.indicator_1.permission
            permission.update_user_permission(
                self.creator_in_group, PERMISSIONS.READ_DATA.name
            )

            # Create values
            values = [
                # Ref 1 Indicator 1
                [self.ref_1, self.indicator_1, '2020-01-01', 1, 'A', 2.1],
                [self.ref_1, self.indicator_1, '2020-01-01', 1, 'B', 1],
                [self.ref_1, self.indicator_1, '2020-01-01', 1, 'C', 3],
                [self.ref_1, self.indicator_1, '2020-01-01', 2, 'AA', 1],
                [self.ref_1, self.indicator_1, '2020-01-01', 2, 'BA', 1],
                [self.ref_1, self.indicator_1, '2020-05-01', 1, 'A', 3],
                [self.ref_1, self.indicator_1, '2020-05-01', 1, 'B', 4],
                [self.ref_1, self.indicator_1, '2020-05-01', 2, 'AA', 4],
                [self.ref_1, self.indicator_1, '2020-05-01', 2, 'BA', 2],
                # Ref 1 Indicator 2
                [self.ref_1, self.indicator_2, '2020-02-01', 1, 'A', 2],
                [self.ref_1, self.indicator_2, '2020-02-01', 1, 'B', 1],
                [self.ref_1, self.indicator_2, '2020-02-01', 1, 'C', 3],
                [self.ref_1, self.indicator_2, '2020-02-01', 2, 'AA', 1],
                [self.ref_1, self.indicator_2, '2020-02-01', 2, 'BA', 1],
                [self.ref_1, self.indicator_2, '2020-03-01', 1, 'A', 3],
                [self.ref_1, self.indicator_2, '2020-03-01', 1, 'B', 4],
                [self.ref_1, self.indicator_2, '2020-03-01', 2, 'AA', 4],
                [self.ref_1, self.indicator_2, '2020-03-01', 2, 'BA', 2],
                # Ref 2 Indicator 1
                [self.ref_2, self.indicator_1, '2020-05-01', 1, 'E', 2],
                [self.ref_2, self.indicator_1, '2020-05-01', 1, 'F', 1],
                [self.ref_2, self.indicator_1, '2020-05-01', 1, 'G', 3],
                [self.ref_2, self.indicator_1, '2020-05-01', 2, 'EA', 1],
                [self.ref_2, self.indicator_1, '2020-05-01', 2, 'FA', 1],
                [self.ref_2, self.indicator_1, '2020-06-01', 1, 'E', 3],
                [self.ref_2, self.indicator_1, '2020-06-01', 1, 'F', 4],
                [self.ref_2, self.indicator_1, '2020-06-01', 2, 'EA', 4],
                [self.ref_2, self.indicator_1, '2020-06-01', 2, 'FA', 2],
                # Ref 2 Indicator 2
                [self.ref_2, self.indicator_2, '2020-06-01', 1, 'E', 2],
                [self.ref_2, self.indicator_2, '2020-06-01', 1, 'F', 1],
                [self.ref_2, self.indicator_2, '2020-06-01', 1, 'G', 3],
                [self.ref_2, self.indicator_2, '2020-06-01', 2, 'EA', 1],
                [self.ref_2, self.indicator_2, '2020-06-01', 2, 'FA', 1],
                [self.ref_2, self.indicator_2, '2020-07-01', 1, 'E', 3],
                [self.ref_2, self.indicator_2, '2020-07-01', 1, 'F', 4],
                [self.ref_2, self.indicator_2, '2020-07-01', 2, 'EA', 4],
                [self.ref_2, self.indicator_2, '2020-07-01', 2, 'FA', 2],
            ]
            for value in values:
                self.create_value(
                    value[0], value[1], value[2], value[3], value[4], value[5]
                )

        def create_resource(self, user):
            """Create resource function."""
            pass

        def create_value(
                self, reference_layer: ReferenceLayerView,
                indicator: Indicator,
                date_str,
                admin_level, geom_id, value
        ):
            """Create Indicator Value."""
            indicator.save_value(
                datetime.strptime(date_str, '%Y-%m-%d'), geom_id, value,
                reference_layer=reference_layer, admin_level=admin_level
            )

        def get_resources(self, user):
            """Create resource function."""
            return None

        def data_count(self, response):
            """Create resource function."""
            count_data = 0
            for result in response.json()['results']:
                count_data += result['data_count']
            return count_data
