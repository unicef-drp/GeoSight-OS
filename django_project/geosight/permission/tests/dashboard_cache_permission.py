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
__date__ = '26/02/2026'
__copyright__ = ('Copyright 2026, Unicef')

import factory
from django.contrib.auth import get_user_model

from core.models.profile import ROLES
from core.tests.base_tests import TestCase
from core.tests.model_factories import GroupF, create_user
from geosight.data.models.context_layer import ContextLayer, LayerType
from geosight.data.models.dashboard import (
    Dashboard, DashboardIndicator, DashboardRelatedTable,
    DashboardContextLayer, DashboardCachePermissions
)
from geosight.data.models.indicator import Indicator
from geosight.data.models.related_table import RelatedTable
from geosight.permission.models.factory import PERMISSIONS

User = get_user_model()


class DashboardCachePermissionTest(TestCase):
    """Test for DashboardPermission Test."""

    def create_dashboard(self, user) -> Dashboard:
        """Create resource function."""
        return Dashboard.permissions.create(
            user=user,
            name=factory.Sequence(lambda n: 'Dashboard {}'.format(n))
        )

    def create_indicator(self, user, dashboard):
        """Create resource function."""
        obj = Indicator.permissions.create(
            user=user,
            name='name'
        )
        DashboardIndicator.objects.create(
            dashboard=dashboard,
            object=obj
        )
        return obj

    def create_context_layer(self, user, dashboard):
        """Create resource function."""
        obj = ContextLayer.permissions.create(
            user=user,
            name='name',
            url='url',
            layer_type=LayerType.ARCGIS
        )
        DashboardContextLayer.objects.create(
            dashboard=dashboard,
            object=obj
        )
        return obj

    def create_related_table(self, user, dashboard):
        """Create resource function."""
        obj = RelatedTable.permissions.create(user=user, name='name')
        DashboardRelatedTable.objects.create(
            dashboard=dashboard,
            object=obj
        )
        return obj

    def setUp(self):
        """To setup test."""
        self.admin = create_user(ROLES.SUPER_ADMIN.name)
        self.creator = create_user(ROLES.CREATOR.name)
        self.contributor = create_user(ROLES.CONTRIBUTOR.name)
        self.viewer = create_user(ROLES.VIEWER.name)
        self.resource_creator = create_user(ROLES.CREATOR.name)

        self.group = GroupF()
        self.viewer_in_group = create_user(ROLES.VIEWER.name)
        self.viewer_in_group.groups.add(self.group)

        # Resource layer attribute
        self.resource = self.create_dashboard(self.resource_creator)
        self.permission = self.resource.permission
        self.indicator_1 = self.create_indicator(
            self.resource_creator, self.resource
        )
        self.context_layer_1 = self.create_context_layer(
            self.resource_creator, self.resource
        )
        self.related_table_1 = self.create_related_table(
            self.resource_creator, self.resource
        )

        self.resource_2 = self.create_dashboard(self.resource_creator)
        self.permission_2 = self.resource_2.permission
        self.create_indicator(self.resource_creator, self.resource_2)
        self.create_context_layer(self.resource_creator, self.resource_2)
        self.create_related_table(self.resource_creator, self.resource_2)

    def test_cache_permission(self):
        """Test no cache permission."""
        DashboardCachePermissions.get_cache(
            self.resource, self.viewer
        )
        DashboardCachePermissions.get_cache(
            self.resource, self.creator
        )
        DashboardCachePermissions.get_cache(
            self.resource_2, self.viewer
        )
        self.assertEqual(DashboardCachePermissions.objects.count(), 3)

        # check content
        dashboard_1_cache = DashboardCachePermissions.get_cache(
            self.resource, self.viewer
        )

        _ids = dashboard_1_cache['indicators'].keys()
        for indicator in self.resource.dashboardindicator_set.all():
            self.assertIn(f'{indicator.object.id}', _ids)
        for indicator in self.resource_2.dashboardindicator_set.all():
            self.assertNotIn(f'{indicator.object.id}', _ids)

        _ids = dashboard_1_cache['context_layers'].keys()
        for indicator in self.resource.dashboardcontextlayer_set.all():
            self.assertIn(f'{indicator.object.id}', _ids)
        for indicator in self.resource_2.dashboardcontextlayer_set.all():
            self.assertNotIn(f'{indicator.object.id}', _ids)

        _ids = dashboard_1_cache['related_tables'].keys()
        for indicator in self.resource.dashboardrelatedtable_set.all():
            self.assertIn(f'{indicator.object.id}', _ids)
        for indicator in self.resource_2.dashboardrelatedtable_set.all():
            self.assertNotIn(f'{indicator.object.id}', _ids)

        # When resource save
        self.resource.save()
        self.assertIsNone(
            DashboardCachePermissions.objects.get(
                dashboard=self.resource, user=self.viewer
            ).cache
        )
        self.assertIsNotNone(
            DashboardCachePermissions.objects.get(
                dashboard=self.resource_2, user=self.viewer
            ).cache
        )
        DashboardCachePermissions.get_cache(
            self.resource, self.viewer
        )
        self.assertIsNotNone(
            DashboardCachePermissions.objects.get(
                dashboard=self.resource, user=self.viewer
            ).cache
        )

    def test_cache_permission_indicator_content(self):
        """Test no cache permission."""
        permission = self.indicator_1.permission.all_permission(
            self.creator
        )
        # Generate
        DashboardCachePermissions.get_cache(self.resource, self.creator)
        cache = DashboardCachePermissions.objects.get(
            dashboard=self.resource, user=self.creator
        ).cache
        self.assertEqual(
            cache['indicators'][f'{self.indicator_1.id}'][
                DashboardCachePermissions.PERMISSION_KEY], permission
        )
        self.assertFalse(
            cache['indicators'][f'{self.indicator_1.id}'][
                DashboardCachePermissions.PERMISSION_KEY]['share']
        )

        self.indicator_1.permission.update_user_permission(
            self.creator, PERMISSIONS.OWNER.name
        )
        self.indicator_1.permission.save()

        # Should be none
        self.assertIsNone(
            DashboardCachePermissions.objects.get(
                dashboard=self.resource, user=self.creator
            ).cache
        )
        DashboardCachePermissions.get_cache(self.resource, self.creator)
        cache = DashboardCachePermissions.objects.get(
            dashboard=self.resource, user=self.creator
        ).cache
        self.assertTrue(
            cache['indicators'][f'{self.indicator_1.id}'][
                DashboardCachePermissions.PERMISSION_KEY]['share']
        )

    def test_cache_permission_context_layer_content(self):
        """Test no cache permission."""
        permission = self.context_layer_1.permission.all_permission(
            self.creator
        )
        # Generate
        DashboardCachePermissions.get_cache(self.resource, self.creator)
        cache = DashboardCachePermissions.objects.get(
            dashboard=self.resource, user=self.creator
        ).cache
        self.assertEqual(
            cache['context_layers'][f'{self.context_layer_1.id}'][
                DashboardCachePermissions.PERMISSION_KEY], permission
        )
        self.assertFalse(
            cache['context_layers'][f'{self.context_layer_1.id}'][
                DashboardCachePermissions.PERMISSION_KEY]['share']
        )

        self.context_layer_1.permission.update_user_permission(
            self.creator, PERMISSIONS.OWNER.name
        )
        self.context_layer_1.permission.save()

        # Should be none
        self.assertIsNone(
            DashboardCachePermissions.objects.get(
                dashboard=self.resource, user=self.creator
            ).cache
        )
        DashboardCachePermissions.get_cache(self.resource, self.creator)
        cache = DashboardCachePermissions.objects.get(
            dashboard=self.resource, user=self.creator
        ).cache
        self.assertTrue(
            cache['context_layers'][f'{self.context_layer_1.id}'][
                DashboardCachePermissions.PERMISSION_KEY]['share']
        )

    def test_cache_permission_related_table_content(self):
        """Test no cache permission."""
        permission = self.related_table_1.permission.all_permission(
            self.creator
        )
        # Generate
        DashboardCachePermissions.get_cache(self.resource, self.creator)
        cache = DashboardCachePermissions.objects.get(
            dashboard=self.resource, user=self.creator
        ).cache
        self.assertEqual(
            cache['related_tables'][f'{self.related_table_1.id}'][
                DashboardCachePermissions.PERMISSION_KEY], permission
        )
        self.assertFalse(
            cache['related_tables'][f'{self.related_table_1.id}'][
                DashboardCachePermissions.PERMISSION_KEY]['share']
        )

        self.related_table_1.permission.update_user_permission(
            self.creator, PERMISSIONS.OWNER.name
        )
        self.related_table_1.permission.save()

        # Should be none
        self.assertIsNone(
            DashboardCachePermissions.objects.get(
                dashboard=self.resource, user=self.creator
            ).cache
        )
        DashboardCachePermissions.get_cache(self.resource, self.creator)
        cache = DashboardCachePermissions.objects.get(
            dashboard=self.resource, user=self.creator
        ).cache
        self.assertTrue(
            cache['related_tables'][f'{self.related_table_1.id}'][
                DashboardCachePermissions.PERMISSION_KEY]['share']
        )
