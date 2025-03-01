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

from datetime import datetime

from django.contrib.auth import get_user_model
from django.urls import reverse

from geosight.data.models import Indicator
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

User = get_user_model()


class DatasetApiTest(BasePermissionTest.TestCase):
    """Test for dataset list api."""

    payload = {
        'name': 'name'
    }

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

        super(DatasetApiTest, self).setUp()
        self.indicator_1 = IndicatorF(
            name='name_1',
            creator=self.creator
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
            [self.ref_1, self.indicator_1, '2020-01-01', 1, 'A', 2],
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
            self, reference_layer: ReferenceLayerView, indicator: Indicator,
            date_str,
            admin_level, geom_id, value
    ):
        """Create Indicator Value."""
        indicator.save_value(
            datetime.strptime(date_str, '%Y-%m-%d'), geom_id, value,
            reference_layer=reference_layer, admin_level=admin_level
        )

    def data_count(self, response):
        """Create resource function."""
        count_data = 0
        for result in response.json()['results']:
            count_data += result['data_count']
        return count_data

    def assert_ids(self, list_url, ids_url):
        """List dataset ids."""
        user = self.admin
        # admin
        list_response = self.assertRequestGetView(
            f'{list_url}', 200, user=user
        )
        list_response_ids = [
            result['id'] for result in list_response.json()['results']
        ]

        response = self.assertRequestGetView(
            f'{ids_url}',
            200, user=user
        )
        response_ids = response.json()
        response_ids.sort()
        list_response_ids.sort()
        self.assertEqual(
            response_ids,
            list_response_ids
        )

    def test_list_api_by_admin(self):
        """Test List API."""
        url = reverse('dataset-list')
        self.assertRequestGetView(url, 403)

        # admin
        user = self.admin
        response = self.assertRequestGetView(url, 200, user=user)
        self.assertEqual(response.json()['count'], 8)
        self.assertEqual(self.data_count(response), 36)

        # by indicators
        response = self.assertRequestGetView(
            f'{url}?indicator_id__in={",".join([f"{self.indicator_1.id}"])}',
            200,
            user=user
        )
        self.assertEqual(response.json()['count'], 4)
        self.assertEqual(self.data_count(response), 18)

        # by reference layers
        response = self.assertRequestGetView(
            f'{url}?country__in={self.country_1.id}',
            200, user=user
        )
        self.assertEqual(response.json()['count'], 4)
        self.assertEqual(self.data_count(response), 18)

        # by levels
        response = self.assertRequestGetView(
            f'{url}?entity_admin_level__in=1', 200, user=user
        )
        self.assertEqual(response.json()['count'], 4)
        self.assertEqual(self.data_count(response), 20)

    def test_list_api_by_creator(self):
        """Test List API."""
        user = self.creator
        url = reverse('dataset-list')

        # admin
        response = self.assertRequestGetView(url, 200, user=user)
        self.assertEqual(response.json()['count'], 4)
        self.assertEqual(self.data_count(response), 18)

        # by indicators
        response = self.assertRequestGetView(
            f'{url}?indicator_id__in={",".join([f"{self.indicator_1.id}"])}',
            200,
            user=user
        )
        self.assertEqual(response.json()['count'], 4)
        self.assertEqual(self.data_count(response), 18)

        response = self.assertRequestGetView(
            f'{url}?indicator_id__in={",".join([f"{self.indicator_2.id}"])}',
            200,
            user=user
        )
        self.assertEqual(response.json()['count'], 0)
        self.assertEqual(self.data_count(response), 0)

        # by reference layers
        response = self.assertRequestGetView(
            f'{url}?country_id__in={self.country_1.id}',
            200, user=user
        )
        self.assertEqual(response.json()['count'], 2)
        self.assertEqual(self.data_count(response), 9)

        # by levels
        response = self.assertRequestGetView(
            f'{url}?entity_admin_level__in=1', 200, user=user
        )
        self.assertEqual(response.json()['count'], 2)
        self.assertEqual(self.data_count(response), 10)

    def test_ids_api(self):
        """Test List API Ids."""
        list_url = reverse('dataset-list')
        url = reverse('dataset-ids')

        self.assert_ids(f'{list_url}?page_size=1000', f'{url}')
        self.assert_ids(
            f'{list_url}?entity_admin_level__in=1',
            f'{url}?entity_admin_level__in=1'
        )
        self.assert_ids(
            f'{list_url}?group_admin_level=true',
            f'{url}?group_admin_level=true'
        )

    def test_delete_api(self):
        """Test List API."""
        user = self.creator_in_group
        url = reverse('dataset-list')

        # admin
        response = self.assertRequestGetView(
            f'{url}?detail=true&group_admin_level=true&'
            f'entity_admin_level__in=1', 200, user=user
        )
        self.assertEqual(self.data_count(response), 20)

        ids = [res['id'] for res in response.json()['results']]
        self.assertRequestDeleteView(url, 204, user=user, data=ids)

        # admin
        response = self.assertRequestGetView(url, 200, user=user)
        self.assertEqual(response.json()['count'], 6)
        self.assertEqual(self.data_count(response), 26)
