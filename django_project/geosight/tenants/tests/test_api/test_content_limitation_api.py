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

    def test_list(self):
        """Test create Content Limitation API."""
        url = reverse('content-limitation-list')
        self.change_public_tenant()
        self.assertRequestGetView(
            url, 403, self.user_1
        )
        response = self.assertRequestGetView(
            url, 200, self.admin_1
        )
        self.assertEqual(response.json()['count'], 7)

        # Test tenant that is not public
        self.change_second_tenant()
        self.assertRequestGetView(
            url, 403, self.admin_2
        )

    def test_create(self):
        """Test create tenant API."""
        url = reverse('content-limitation-list')
        self.change_public_tenant()
        self.assertRequestPostView(
            url, 403, data={}, user=self.user_1
        )
        self.change_public_tenant()
        self.assertRequestPostView(
            url, 405, data={}, user=self.admin_1
        )

        # Test tenant that is not public
        self.change_second_tenant()
        self.assertRequestPostView(
            url, 403, data={}, user=self.admin_2
        )

    def test_get(self):
        """Test create tenant API."""
        url = reverse('content-limitation-detail', kwargs={'pk': 1})
        self.change_public_tenant()
        self.assertRequestGetView(
            url, 403, user=self.user_1
        )
        self.change_public_tenant()
        self.assertRequestGetView(
            url, 200, user=self.admin_1
        )

        # Test tenant that is not public
        self.change_second_tenant()
        self.assertRequestGetView(
            url, 403, user=self.admin_2
        )

    def test_update(self):
        """Test create tenant API."""
        url = reverse('content-limitation-detail', kwargs={'pk': 1})
        self.change_public_tenant()
        self.assertRequestPutView(
            url, 403, data={}, user=self.user_1
        )
        self.change_public_tenant()
        self.assertRequestPutView(
            url, 405, data={}, user=self.admin_1
        )

        # Test tenant that is not public
        self.change_second_tenant()
        self.assertRequestPutView(
            url, 403, data={}, user=self.admin_2
        )

    def test_patch(self):
        """Test create tenant API."""
        url = reverse('content-limitation-detail', kwargs={'pk': 1})
        self.change_public_tenant()
        self.assertRequestPatchView(
            url, 403, data={}, user=self.user_1
        )
        self.change_public_tenant()
        self.assertRequestPatchView(
            url, 405, data={}, user=self.admin_1
        )

        # Test tenant that is not public
        self.change_second_tenant()
        self.assertRequestPatchView(
            url, 403, data={}, user=self.admin_2
        )

    def test_delete(self):
        """Test create tenant API."""
        url = reverse('content-limitation-detail', kwargs={'pk': 1})
        self.change_public_tenant()
        self.assertRequestDeleteView(
            url, 403, data={}, user=self.user_1
        )
        self.change_public_tenant()
        self.assertRequestDeleteView(
            url, 405, data={}, user=self.admin_1
        )

        # Test tenant that is not public
        self.change_second_tenant()
        self.assertRequestDeleteView(
            url, 403, data={}, user=self.admin_2
        )
