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


class DatasetApiTest(BaseDataBrowserTest.TestCase):
    """Test for dataset list api."""

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

        # by country
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

        # Check if it return permission or not
        with self.assertRaises(KeyError):
            response.json()['results'][0]['permission']  # noqa

        # admin with detail
        response = self.assertRequestGetView(
            f'{url}?detail=true', 200, user=user
        )
        self.assertEqual(response.json()['count'], 4)
        self.assertEqual(self.data_count(response), 18)
        # Permission returned
        self.assertIsNotNone(response.json()['results'][0]['permission'])

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

        # by country
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
            f'{url}?group_admin_level=true&'
            f'entity_admin_level__in=1', 200, user=user
        )
        self.assertEqual(self.data_count(response), 20)

        ids = [res['id'] for res in response.json()['results']]
        self.assertRequestDeleteView(url, 204, user=user, data=ids)

        # admin
        response = self.assertRequestGetView(url, 200, user=user)
        self.assertEqual(response.json()['count'], 6)
        self.assertEqual(self.data_count(response), 26)
