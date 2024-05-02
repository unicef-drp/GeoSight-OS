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
__date__ = '24/10/2023'
__copyright__ = ('Copyright 2023, Unicef')

from datetime import datetime

import mock
from core.tests.base_tests import TenantTestCase as TestCase
from django.urls import reverse

from core.models.maintenance import Maintenance
from core.models.profile import ROLES
from core.tests.base_tests import BaseTest
from core.tests.model_factories import create_user


class MaintenanceApiTest(BaseTest, TestCase):
    """Test for maintenance."""

    @mock.patch('core.api.maintenance.datetime')
    def test_maintenance_api(self, mocked_datetime):
        """Test maintenance api."""
        user = create_user(ROLES.SUPER_ADMIN.name)
        mocked_datetime.now.return_value = datetime.strptime(
            '2023-01-06 06:10:00.000 +0800',
            '%Y-%m-%d %H:%M:%S.%f %z'
        )

        # Check if not scheduled
        maintenance = Maintenance.objects.create(
            message='Test',
            scheduled_from='2023-01-06 07:00:00.000+0800',
            creator=user
        )

        url = reverse('maintenance-view')
        response = self.assertRequestGetView(url, 200)
        self.assertEqual(
            response.data['id'],
            maintenance.id
        )

        # Check scheduled
        maintenance.scheduled_from = '2023-01-06 06:00:00.000+0800'
        maintenance.save()
        response = self.assertRequestGetView(url, 200)
        self.assertEqual(
            response.data['id'],
            maintenance.id
        )

        # Check scheduled
        maintenance.scheduled_from = '2023-01-04 06:00:00.000+0800'
        maintenance.scheduled_end = '2023-01-05 06:00:00.000+0800'
        maintenance.save()
        response = self.assertRequestGetView(url, 200)
        self.assertFalse('id' in response.data)
