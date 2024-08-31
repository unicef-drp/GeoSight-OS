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
__date__ = '31/08/2024'
__copyright__ = ('Copyright 2023, Unicef')

from django.urls import reverse

from geosight.tenants.tests.base_test import BaseTenantTestCase


class ContentLimitationApiTest(BaseTenantTestCase.TestCase):
    """Test for create Content Limitation."""
    url = reverse('content-limitations-list')

    def test_list(self):
        """Test create Content Limitation API."""
        self.change_public_tenant()
        self.assertRequestGetView(
            self.url, 403, self.user_1
        )
        response = self.assertRequestGetView(
            self.url, 200, self.admin_1
        )
        self.assertEqual(response.json()['count'], 16)

        # Test tenant that is not public
        self.change_second_tenant()
        self.assertRequestGetView(
            self.url, 403, self.admin_2
        )
