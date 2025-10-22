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

from django.urls import reverse

from geosight.data.tests.api.v1.indicator_value.base import BaseDataBrowserTest


class DatasetApiGroupedDataTest(BaseDataBrowserTest.TestCase):
    """Test for dataset list api."""

    def test_list_api_by_admin(self):
        """Test List API."""
        url = reverse('dataset-list') + '?group_admin_level=true'
        self.assertRequestGetView(url, 403)

        # admin
        user = self.admin
        response = self.assertRequestGetView(url, 200, user=user)
        self.assertEqual(response.json()['count'], 4)
        self.assertEqual(self.data_count(response), 36)

        # by indicators
        response = self.assertRequestGetView(
            f'{url}&indicator_id__in={",".join([f"{self.indicator_1.id}"])}',
            200,
            user=user
        )
        self.assertEqual(response.json()['count'], 2)
        self.assertEqual(self.data_count(response), 18)

        # by country
        response = self.assertRequestGetView(
            f'{url}?country__in={self.country_1.id}',
            200, user=user
        )
        self.assertEqual(response.json()['count'], 8)
        self.assertEqual(self.data_count(response), 36)

        # by levels
        response = self.assertRequestGetView(
            f'{url}&admin_level__in=1', 200, user=user
        )
        self.assertEqual(response.json()['count'], 4)
        self.assertEqual(self.data_count(response), 20)

        # by id
        response = self.assertRequestGetView(
            f'{url}&indicator_id__in={",".join([f"{self.indicator_1.id}"])}&'
            f'country__in={self.country_1.id}',
            200, user=user
        )
        response = self.assertRequestGetView(
            f'{url}&id__in='
            f'{self.indicator_1.id}-{self.country_1.id}-[1,2]',
            200, user=user
        )
        self.assertEqual(response.json()['count'], 1)
        self.assertEqual(self.data_count(response), 9)

        response = self.assertRequestGetView(
            f'{url}&id__in='
            f'{self.indicator_1.id}-{self.country_1.id}-[1,2],'
            f'{self.indicator_2.id}-{self.country_1.id}-[1,2]',
            200, user=user
        )
        self.assertEqual(response.json()['count'], 2)
        self.assertEqual(self.data_count(response), 18)

    def test_list_api_by_creator(self):
        """Test List API."""
        user = self.creator
        url = reverse('dataset-list') + '?group_admin_level=true'

        # admin
        response = self.assertRequestGetView(url, 200, user=user)
        self.assertEqual(response.json()['count'], 2)
        self.assertEqual(self.data_count(response), 18)

        # by indicators
        response = self.assertRequestGetView(
            f'{url}&indicator_id__in={",".join([f"{self.indicator_1.id}"])}',
            200,
            user=user
        )
        self.assertEqual(response.json()['count'], 2)
        self.assertEqual(self.data_count(response), 18)

        response = self.assertRequestGetView(
            f'{url}&indicator_id__in={",".join([f"{self.indicator_2.id}"])}',
            200,
            user=user
        )
        self.assertEqual(response.json()['count'], 0)
        self.assertEqual(self.data_count(response), 0)

        # by country
        response = self.assertRequestGetView(
            f'{url}?country__in={self.country_1.id}',
            200, user=user
        )
        self.assertEqual(response.json()['count'], 4)
        self.assertEqual(self.data_count(response), 18)

        # by levels
        response = self.assertRequestGetView(
            f'{url}&admin_level__in=1', 200, user=user
        )
        self.assertEqual(self.data_count(response), 10)

    def test_delete_api(self):
        """Test List API."""
        user = self.creator_in_group
        url = reverse('dataset-list') + '?detail=true&group_admin_level=true'

        # admin
        response = self.assertRequestGetView(
            f'{url}&admin_level__in=1', 200, user=user
        )
        self.assertEqual(self.data_count(response), 20)

        ids = [res['id'] for res in response.json()['results']]
        self.assertRequestDeleteView(url, 204, user=user, data=ids)

        # admin
        response = self.assertRequestGetView(url, 200, user=user)
        self.assertEqual(response.json()['count'], 4)
        self.assertEqual(self.data_count(response), 26)
