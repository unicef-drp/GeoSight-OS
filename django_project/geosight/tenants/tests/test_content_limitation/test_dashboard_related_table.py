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

from django.contrib.contenttypes.models import ContentType

from core.tests.base_tests import TestCase
from geosight.data.tests.model_factories import (
    DashboardF, DashboardRelatedTableF, DashboardRelatedTable
)
from geosight.tenants.models.content_limitation import (
    ContentLimitation, AlreadyReachTheLimit
)


class ModelLimitationTest(TestCase):
    """Test for model limitation."""

    Model = DashboardRelatedTable
    Factory = DashboardRelatedTableF

    def create_instance(self, dashboard):
        """Create instance."""
        return self.Factory(dashboard=dashboard)

    def test_limit(self):
        """Test dashboard limit."""
        self.change_public_tenant()
        content_type = ContentType.objects.get_for_model(self.Model)
        self.assertEqual(
            ContentLimitation.objects.filter(
                content_type=content_type
            ).count(), 2
        )
        # ------------------------------------------
        # Tenant 1 Dashboard 1
        # ------------------------------------------
        dashboard = DashboardF()
        instance = self.create_instance(dashboard)
        self.assertEqual(instance.model_data_count, 1)
        self.assertFalse(instance.has_reach_limit)
        self.assertEqual(self.Model.get_limit(self.Model), None)

        # We add limit to 2
        _limit = self.Model.get_limit_obj(self.Model)
        _limit.update_limit(3)

        # 2nd and 3rd are ok
        self.create_instance(dashboard)
        self.create_instance(dashboard)
        self.assertTrue(instance.has_reach_limit)
        with self.assertRaises(AlreadyReachTheLimit):
            # 4th is the limit
            self.create_instance(dashboard)

        # Check if model data limitation is just 1 from above creation
        self.assertEqual(
            ContentLimitation.objects.filter(
                content_type=content_type,
                model_field_group=self.Model.limit_by_field_name
            ).count(), 2
        )
        # ------------------------------------------
        # Tenant 1 Dashboard 2
        # ------------------------------------------
        dashboard = DashboardF()
        instance = self.create_instance(dashboard)
        self.assertEqual(instance.model_data_count, 1)

        # 2nd and 3rd are ok
        self.create_instance(dashboard)
        self.create_instance(dashboard)
        self.assertTrue(instance.has_reach_limit)
        with self.assertRaises(AlreadyReachTheLimit):
            # 4th is the limit
            self.create_instance(dashboard)

        # Check if model data limitation is just 1 from above creation
        self.assertEqual(
            ContentLimitation.objects.filter(
                content_type=content_type,
                model_field_group=self.Model.limit_by_field_name
            ).count(), 2
        )

        # ------------------------------------------
        # tenant 2 dashboard 1
        # ------------------------------------------
        self.change_second_tenant()
        dashboard = DashboardF()
        instance = self.create_instance(dashboard)
        self.assertEqual(instance.model_data_count, 1)
        self.assertFalse(instance.has_reach_limit)
        self.assertEqual(self.Model.get_limit(self.Model), None)

        # We add limit to 1
        _limit = self.Model.get_limit_obj(self.Model)
        _limit.update_limit(1)

        # Second one is the limit
        self.assertTrue(instance.has_reach_limit)
        with self.assertRaises(AlreadyReachTheLimit):
            # 3rd is the limit
            self.create_instance(dashboard)

        # Check if model data limitation is 2
        self.assertEqual(
            ContentLimitation.objects.filter(
                content_type=content_type
            ).count(), 2
        )

        # ------------------------------------------
        # tenant 2 dashboard 2
        # ------------------------------------------
        self.change_second_tenant()
        dashboard = DashboardF()
        instance = self.create_instance(dashboard)
        self.assertEqual(instance.model_data_count, 1)

        # Second one is the limit
        self.assertTrue(instance.has_reach_limit)
        with self.assertRaises(AlreadyReachTheLimit):
            # 3rd is the limit
            self.create_instance(dashboard)

        # Check if model data limitation is 2
        self.assertEqual(
            ContentLimitation.objects.filter(
                content_type=content_type
            ).count(), 2
        )
