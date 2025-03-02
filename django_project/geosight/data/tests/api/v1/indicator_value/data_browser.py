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

from django.contrib.auth import get_user_model
from django.urls import reverse

from geosight.data.tests.api.v1.indicator_value.base import BaseDataBrowserTest

User = get_user_model()


class DataBrowserApiTest(BaseDataBrowserTest.TestCase):
    """Test for dataset list api."""

    def test_list_api_by_admin(self):
        """Test List API."""
        url = reverse('data-browser-api')
        self.assertRequestGetView(url, 403)

        # admin
        user = self.admin
        response = self.assertRequestGetView(url, 200, user=user)
        self.assertEqual(len(response.json()['results']), 36)

        # by indicators
        response = self.assertRequestGetView(
            f'{url}?indicator_id__in={",".join([f"{self.indicator_1.id}"])}',
            200,
            user=user
        )
        self.assertEqual(len(response.json()['results']), 18)

        # by country
        response = self.assertRequestGetView(
            f'{url}?country_id__in={self.country_1.id}',
            200, user=user
        )
        self.assertEqual(len(response.json()['results']), 18)

        # by levels
        response = self.assertRequestGetView(
            f'{url}?entity_admin_level__in=1', 200, user=user
        )
        self.assertEqual(len(response.json()['results']), 20)

        # by codes
        response = self.assertRequestGetView(
            f'{url}?geom_id__in=A,B', 200, user=user
        )
        self.assertEqual(len(response.json()['results']), 8)

        # by time
        response = self.assertRequestGetView(
            f'{url}?date__gte=2020-06-01', 200, user=user
        )
        self.assertEqual(len(response.json()['results']), 13)

        # Check the comments
        response = self.assertRequestGetView(
            f'{url}?indicator_id__in={",".join([f"{self.indicator_1.id}"])}'
            '&geom_id__in=A,B&date__lte=2020-01-01',
            200,
            user=user
        )
        results = response.json()['results']
        self.assertEqual(len(results), 2)
        for result in results:
            if result['geom_id'] == 'A':
                self.assertEqual(
                    result['attributes']['description'],
                    'Result was rounded to int.'
                )
            else:
                self.assertTrue('description' not in result['attributes'])

    def test_list_api_by_creator(self):
        """Test List API."""
        user = self.creator
        url = reverse('data-browser-api')

        # admin
        response = self.assertRequestGetView(url, 200, user=user)
        self.assertEqual(len(response.json()['results']), 18)

        # by indicators
        response = self.assertRequestGetView(
            f'{url}?indicator_id__in={",".join([f"{self.indicator_1.id}"])}',
            200,
            user=user
        )
        self.assertEqual(len(response.json()['results']), 18)

        response = self.assertRequestGetView(
            f'{url}?indicator_id__in={",".join([f"{self.indicator_2.id}"])}',
            200,
            user=user
        )
        self.assertEqual(len(response.json()['results']), 0)

        # by country
        response = self.assertRequestGetView(
            f'{url}?country_id__in={self.country_1.id}',
            200, user=user
        )
        self.assertEqual(len(response.json()['results']), 9)

        # by levels
        response = self.assertRequestGetView(
            f'{url}?entity_admin_level__in=1', 200, user=user
        )
        self.assertEqual(len(response.json()['results']), 10)

        # by codes
        response = self.assertRequestGetView(
            f'{url}?geom_id__in=A,B', 200, user=user
        )
        self.assertEqual(len(response.json()['results']), 4)

        # by time
        response = self.assertRequestGetView(
            f'{url}?date__gte=2020-06-01', 200, user=user
        )
        self.assertEqual(len(response.json()['results']), 4)
