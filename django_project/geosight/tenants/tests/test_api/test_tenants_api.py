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
__date__ = '28/08/2024'
__copyright__ = ('Copyright 2023, Unicef')

from django.urls import reverse

from geosight.tenants.tests.base_test import BaseTenantTestCase


class TenantsApiTest(BaseTenantTestCase.TestCase):
    """Test for create tenant."""

    def test_list(self):
        """Test create tenant API."""
        url = reverse('tenants-list')
        self.change_public_tenant()
        self.assertRequestGetView(
            url, 403, self.user_1
        )
        response = self.assertRequestGetView(
            url, 200, self.admin_1
        )
        self.assertEqual(response.json()['count'], 2)

        # Test tenant that is not public
        self.change_second_tenant()
        self.assertRequestGetView(
            url, 403, self.admin_2
        )

    def test_create(self):
        """Test create tenant API."""
        url = reverse('tenants-list')
        self.change_public_tenant()
        self.assertRequestPostView(
            url, 403, data={}, user=self.user_1
        )
        self.assertRequestPostView(
            url, 400, user=self.admin_1, data={}
        )
        self.assertRequestPostView(
            url, 400, user=self.admin_1, data={
                'domain': 'new'
            }
        )
        self.assertRequestPostView(
            url, 201, user=self.admin_1, data={
                'domain': 'new',
                'email': 'test@example.com',
            }
        )
        self.change_public_tenant()
        response = self.assertRequestGetView(
            url, 200, user=self.admin_1
        )
        self.assertEqual(response.json()['count'], 3)

        # Test tenant that is not public
        self.change_second_tenant()
        self.assertRequestPostView(
            url, 403, data={}, user=self.admin_2
        )
