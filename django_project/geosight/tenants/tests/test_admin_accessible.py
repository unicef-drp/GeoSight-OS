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

from core.models.profile import ROLES
from core.tests.base_tests import APITestCase
from core.tests.model_factories import create_user

User = get_user_model()


class TenantAdminAccessibleTest(APITestCase):
    """Test for Tenant admin accessible.

    Test can be accessed just by primary tenant.
    """

    def test_admin_accessible(self):
        """Test can be accessed just by primary tenant."""
        tenant_1_admin = create_user(
            ROLES.SUPER_ADMIN.name, password=self.password,
            username='superuser-1', is_staff=True, is_superuser=True
        )
        self.assertRequestGetView(
            '/django-admin/geosight_tenants/client/', 200, tenant_1_admin
        )

        # If it is not primary
        self.set_tenant_connection(self.tenants[1])
        tenant_2_admin = create_user(
            ROLES.SUPER_ADMIN.name, password=self.password,
            username='superuser-2', is_staff=True, is_superuser=True
        )
        self.assertRequestGetView(
            '/django-admin/geosight_tenants/client/', 404, tenant_2_admin
        )
