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

from core.models.profile import ROLES
from core.tests.base_tests import APITestCase
from core.tests.model_factories import create_user


class BaseTenantTestCase(object):
    """Test case for tenant."""

    class TestCase(APITestCase):
        """Test for Tenant admin accessible.

        Test can be accessed just by primary tenant.
        """

        def setUp(self):
            """To setup test."""
            super().setUp()
            self.change_public_tenant()
            self.user_1 = create_user(
                ROLES.VIEWER.name, password=self.password,
                username='user'
            )
            self.admin_1 = create_user(
                ROLES.SUPER_ADMIN.name, password=self.password,
                username='superuser', is_staff=True, is_superuser=True
            )

            self.change_second_tenant()
            self.admin_2 = create_user(
                ROLES.SUPER_ADMIN.name, password=self.password,
                username='superuser', is_staff=True, is_superuser=True
            )
