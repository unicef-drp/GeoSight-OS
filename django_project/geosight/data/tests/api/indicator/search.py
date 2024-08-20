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
__date__ = '23/01/2024'
__copyright__ = ('Copyright 2023, Unicef')

from core.tests.base_tests import TestCase
from django.urls import reverse

from geosight.data.tests.model_factories import IndicatorF, IndicatorGroupF
from geosight.permission.tests._base import BasePermissionTest


class IndicatorSearchSimilarityApiTest(BasePermissionTest, TestCase):
    """Test for Indicator detail api."""

    def create_resource(self, user):
        """Create resource function."""
        return

    def get_resources(self, user):
        """Create resource function."""
        return

    def setUp(self):
        """To setup test."""
        super().setUp()
        group = IndicatorGroupF()
        IndicatorF(
            name='Indicator 1',
            group=group
        )
        IndicatorF(
            name='Indicator 2',
            group=group
        )
        IndicatorF(
            name='Name',
            group=group
        )
        self.url = reverse('indicator-search-similarity-api')

    def test_search(self):
        """Test search indicator by similarity."""
        self.assertRequestPostView(self.url, 403, {})

        response = self.assertRequestPostView(self.url, 200, {}, self.admin)
        self.assertEquals(len(response.json()), 0)

        response = self.assertRequestPostView(
            self.url, 200, {'name': 'Indicator'}, self.admin
        )
        self.assertEquals(len(response.json()), 2)
