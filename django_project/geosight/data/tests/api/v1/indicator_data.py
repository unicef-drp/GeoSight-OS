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


class IndicatorDataApiTest(BaseDataBrowserTest.TestCase):
    """Test for IndicatorData list api."""

    def test_list_permission_without_id(self):
        """Test list permission."""
        url = reverse(
            'indicator_data-list', args=[self.indicator_1.id]
        )
        url = url.replace(f'{self.indicator_1.id}/', '')
        self.assertRequestGetView(url, 403)
        self.assertRequestGetView(url, 403, user=self.viewer)
        self.assertRequestGetView(url, 403, user=self.viewer_in_group)
        self.assertRequestGetView(url, 403, user=self.contributor)
        self.assertRequestGetView(url, 403, user=self.contributor_in_group)
        self.assertRequestGetView(url, 403, user=self.resource_creator)
        self.assertRequestGetView(url, 200, user=self.creator_in_group)
        self.assertRequestGetView(url, 200, user=self.creator)
        self.assertRequestGetView(url, 200, user=self.admin)

    def test_list_permission(self):
        """Test list permission."""
        url = reverse(
            'indicator_data-list', args=[self.indicator_1.id]
        )
        self.assertRequestGetView(url, 403)
        self.assertRequestGetView(url, 403, user=self.viewer)
        self.assertRequestGetView(url, 403, user=self.viewer_in_group)
        self.assertRequestGetView(url, 403, user=self.contributor)
        self.assertRequestGetView(url, 403, user=self.contributor_in_group)
        self.assertRequestGetView(url, 403, user=self.resource_creator)
        self.assertRequestGetView(url, 200, user=self.creator_in_group)
        self.assertRequestGetView(url, 200, user=self.creator)
        self.assertRequestGetView(url, 200, user=self.admin)

    def test_list_api_by_admin(self):
        """Test List API."""
        url = reverse(
            'indicator_data-list', args=[self.indicator_1.id]
        )
        self.assertRequestGetView(url, 403)

        # admin
        user = self.admin
        response = self.assertRequestGetView(url, 200, user=user)
        self.assertEqual(len(response.json()['results']), 18)

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
        self.assertEqual(len(response.json()['results']), 9)

        # by levels
        response = self.assertRequestGetView(
            f'{url}?admin_level__in=1', 200, user=user
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
        url = reverse(
            'indicator_data-list', args=[self.indicator_1.id]
        )

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
            f'{url}?admin_level__in=1', 200, user=user
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

    def test_ids_action(self):
        """Test ids action."""
        url = reverse('indicator_data-ids', args=[self.indicator_1.id])
        self.assertRequestGetView(url, 403)
        self.assertRequestGetView(url, 403, user=self.viewer)

        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertEqual(len(response.json()), 18)

        response = self.assertRequestGetView(url, 200, user=self.creator)
        self.assertEqual(len(response.json()), 18)

    def test_values_string_action(self):
        """Test values_string action."""
        url = reverse(
            'indicator_data-values-string', args=[self.indicator_1.id]
        )
        self.assertRequestGetView(url, 403)
        self.assertRequestGetView(url, 403, user=self.viewer)

        response = self.assertRequestGetView(url, 200, user=self.admin)
        results = response.json()
        # 10 distinct geom_id values used as value_str: A, AA, B, BA, C,
        # E, EA, F, FA, G
        self.assertEqual(len(results), 10)
        self.assertEqual(results, sorted(results))

        response = self.assertRequestGetView(url, 200, user=self.creator)
        self.assertEqual(len(response.json()), 10)

    def test_values_action(self):
        """Test values action."""
        url = reverse('indicator_data-values', args=[self.indicator_1.id])
        self.assertRequestGetView(url, 403)
        self.assertRequestGetView(url, 403, user=self.viewer)

        response = self.assertRequestGetView(url, 200, user=self.admin)
        results = response.json()
        self.assertEqual(len(results), 18)

        # Check default fields are present
        first = results[0]
        for field in ('date', 'value', 'value_str', 'entity_id',
                      'indicator_id'):
            self.assertIn(field, first)

        # Filter by geom_id
        response = self.assertRequestGetView(
            f'{url}?geom_id__in=A,B', 200, user=self.admin
        )
        self.assertEqual(len(response.json()), 4)

        # Frequency grouping by monthly
        response = self.assertRequestGetView(
            f'{url}?frequency=monthly', 200, user=self.admin
        )
        # Each geom_id appears in at most one month per ref layer date,
        # so all 18 rows remain distinct after monthly grouping
        self.assertEqual(len(response.json()), 18)

    def test_statistic_action(self):
        """Test statistic action."""
        url = reverse('indicator_data-statistic', args=[self.indicator_1.id])
        self.assertRequestGetView(url, 403)
        self.assertRequestGetView(url, 403, user=self.viewer)

        response = self.assertRequestGetView(url, 200, user=self.admin)
        result = response.json()
        # Default keys are min, max, avg
        self.assertIn('min', result)
        self.assertIn('max', result)
        self.assertIn('avg', result)
        self.assertEqual(result['min'], 1)
        self.assertEqual(result['max'], 4)
