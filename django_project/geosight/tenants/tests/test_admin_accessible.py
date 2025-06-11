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

from django.contrib.auth import get_user_model

from geosight.tenants.tests.base_test import BaseTenantTestCase

User = get_user_model()


class TenantAdminAccessibleTest(BaseTenantTestCase.TestCase):
    """Test for Tenant admin accessible.

    Test can be accessed just by primary tenant.
    """

    url = '/en-us/django-admin/geosight_tenants/tenant/'

    def test_admin_accessible(self):
        """Test can be accessed just by primary tenant."""
        self.change_public_tenant()
        self.assertRequestGetView(
            self.url, 302, self.user_1
        )
        self.assertRequestGetView(
            self.url, 200, self.admin_1
        )

        # Test tenant that is not public
        self.change_second_tenant()
        self.assertRequestGetView(
            self.url, 403, self.admin_2
        )
