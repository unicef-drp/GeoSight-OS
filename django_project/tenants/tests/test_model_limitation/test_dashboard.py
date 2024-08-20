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
__date__ = '19/08/2024'
__copyright__ = ('Copyright 2023, Unicef')

from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from django.db import connection

from core.tests.base_tests import TestCase
from geosight.data.tests.model_factories import DashboardF, Dashboard
from tenants.models.content_limitation import (
    ModelDataLimitation, AlreadyReachTheLimit
)

User = get_user_model()


class ModelLimitationDashboardTest(TestCase):
    """Test for model limitation."""

    def test_dashboard_limit(self):
        """Test dashboard limit."""
        content_type = ContentType.objects.get_for_model(Dashboard)
        self.assertEqual(
            ModelDataLimitation.objects.filter(
                content_type=content_type
            ).count(), 0
        )
        # ------------------------------------------
        # Tenant 1
        # ------------------------------------------
        dashboard = DashboardF()
        self.assertEqual(dashboard.model_data_count, 1)
        self.assertFalse(dashboard.has_reach_limit)
        self.assertEqual(Dashboard.get_limit(Dashboard), None)

        # We add limit to 2
        _limit = Dashboard.get_limit_obj(Dashboard)
        _limit.update_limit(3)

        # 2nd and 3rd are ok
        DashboardF()
        DashboardF()
        self.assertTrue(dashboard.has_reach_limit)
        with self.assertRaises(AlreadyReachTheLimit):
            # 4th is the limit
            DashboardF()

        # Check if model data limitation is just 1 from above creation
        self.assertEqual(
            ModelDataLimitation.objects.filter(
                content_type=content_type
            ).count(), 1
        )

        # ------------------------------------------
        # tenant 2
        # ------------------------------------------
        connection.set_tenant(self.tenant_obj[1].tenant)
        dashboard = DashboardF()
        self.assertEqual(dashboard.model_data_count, 1)
        self.assertFalse(dashboard.has_reach_limit)
        self.assertEqual(Dashboard.get_limit(Dashboard), None)

        # We add limit to 1
        _limit = Dashboard.get_limit_obj(Dashboard)
        _limit.update_limit(1)

        # Second one is the limit
        self.assertTrue(dashboard.has_reach_limit)
        with self.assertRaises(AlreadyReachTheLimit):
            # 3rd is the limit
            DashboardF()

        # Check if model data limitation is 2
        self.assertEqual(
            ModelDataLimitation.objects.filter(
                content_type=content_type
            ).count(), 2
        )
