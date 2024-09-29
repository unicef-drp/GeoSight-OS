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
__date__ = '13/06/2023'
__copyright__ = ('Copyright 2023, Unicef')

from django.contrib.auth import get_user_model

from core.models.profile import ROLES
from core.tests.base_tests import TestCase
from core.tests.model_factories import GroupF, create_user
from geosight.data.models.indicator import Indicator
from geosight.permission.models.factory import PERMISSIONS
from geosight.permission.models.manager import PermissionException

User = get_user_model()


class IndicatorPermissionTest(TestCase):
    """Test for Permission Test."""

    def create_resource(self, user):
        """Create resource function."""
        return Indicator.permissions.create(
            user=user,
            name='name'
        )

    def get_resources(self, user):
        """Create resource function."""
        return Indicator.permissions.list(user)

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
        self.resource = self.create_resource(self.resource_creator)
        self.permission = self.resource.permission

    def assert_permissions(
            self,
            user: User,
            assert_list: bool,
            assert_read: bool,
            assert_edit: bool,
            assert_share: bool,
            assert_delete: bool
    ):
        """Assert all permissions."""
        self.assertEqual(self.permission.has_list_perm(user), assert_list)
        self.assertEqual(self.permission.has_read_perm(user), assert_read)
        self.assertEqual(self.permission.has_edit_perm(user), assert_edit)
        self.assertEqual(self.permission.has_share_perm(user), assert_share)
        self.assertEqual(self.permission.has_delete_perm(user), assert_delete)

    def test_creation(self):
        """Test creation of resource.

        Just admin and creator can do the action.
        """
        self.create_resource(self.admin)
        self.create_resource(self.creator)
        with self.assertRaises(PermissionException):
            self.create_resource(self.contributor)
        with self.assertRaises(PermissionException):
            self.create_resource(self.viewer)

    def test_list(self):
        """Test list of resource."""
        creator = create_user(ROLES.CREATOR.name)
        resource_1 = self.create_resource(creator)
        resource_1.permission.organization_permission = PERMISSIONS.NONE
        resource_1.permission.save()
        resource_2 = self.create_resource(creator)
        resource_2.permission.organization_permission = PERMISSIONS.NONE
        resource_2.permission.save()

        creator_2 = create_user(ROLES.CREATOR.name)
        resource_3 = self.create_resource(creator_2)
        resource_3.permission.organization_permission = PERMISSIONS.NONE
        resource_3.permission.save()

        self.assertEqual(self.get_resources(self.admin).count(), 4)
        self.assertEqual(self.get_resources(creator).count(), 2)
        self.assertEqual(self.get_resources(self.contributor).count(), 0)
        self.assertEqual(self.get_resources(self.viewer).count(), 0)
        self.assertEqual(self.get_resources(None).count(), 0)

        resource_3.permission.update_user_permission(creator, PERMISSIONS.LIST)
        self.assertEqual(self.get_resources(creator).count(), 3)

        resource_2.permission.update_user_permission(
            self.contributor, PERMISSIONS.LIST)
        resource_3.permission.update_user_permission(
            self.contributor, PERMISSIONS.LIST)
        self.assertEqual(self.get_resources(self.contributor).count(), 2)

        self.assertEqual(self.get_resources(self.viewer_in_group).count(), 0)
        resource_3.permission.update_group_permission(
            self.group, PERMISSIONS.LIST)
        self.assertEqual(self.get_resources(self.viewer_in_group).count(), 1)

    def test_admin_layer_permission(self):
        """Check admin permission."""
        user = self.admin
        self.assert_permissions(user, True, True, True, True, True)

    def test_creator_layer_permission(self):
        """Check creator layer permission."""
        user = self.resource_creator
        self.assertEqual(self.resource.creator, user)
        self.assert_permissions(user, True, True, True, True, True)

    def test_creator_permission(self):
        """Check creator permission."""
        user = self.creator
        self.assert_permissions(user, True, False, False, False, False)

        # Assign as list
        self.permission.update_user_permission(user, PERMISSIONS.LIST.name)
        self.assert_permissions(user, True, False, False, False, False)

        # Assign as read
        self.permission.update_user_permission(user, PERMISSIONS.READ.name)
        self.assert_permissions(user, True, True, False, False, False)

        # Assign as write
        self.permission.update_user_permission(user, PERMISSIONS.WRITE.name)
        self.assert_permissions(user, True, True, True, False, False)

        # Assign as share
        self.permission.update_user_permission(user, PERMISSIONS.SHARE.name)
        self.assert_permissions(user, True, True, True, True, False)

        # Assign as delete
        self.permission.update_user_permission(user, PERMISSIONS.OWNER.name)
        self.assert_permissions(user, True, True, True, True, True)

    def test_contributor_permission(self):
        """Check contributor permission."""
        user = self.contributor
        self.assert_permissions(user, True, False, False, False, False)

        # Assign as list
        self.permission.update_user_permission(user, PERMISSIONS.LIST.name)
        self.assert_permissions(user, True, False, False, False, False)

        # Assign as read
        self.permission.update_user_permission(user, PERMISSIONS.READ.name)
        self.assert_permissions(user, True, True, False, False, False)

        # Assign as write
        self.permission.update_user_permission(user, PERMISSIONS.WRITE.name)
        self.assert_permissions(user, True, True, True, False, False)

        # Assign as share
        self.permission.update_user_permission(user, PERMISSIONS.SHARE.name)
        self.assert_permissions(user, True, True, True, False, False)

        # Assign as delete
        self.permission.update_user_permission(user, PERMISSIONS.OWNER.name)
        self.assert_permissions(user, True, True, True, False, False)

    def test_viewer_permission(self):
        """Check viewer permission."""
        user = self.viewer
        self.assert_permissions(user, True, False, False, False, False)

        # Assign as list
        self.permission.update_user_permission(user, PERMISSIONS.LIST.name)
        self.assert_permissions(user, True, False, False, False, False)

        # Assign as read
        self.permission.update_user_permission(user, PERMISSIONS.READ.name)
        self.assert_permissions(user, True, True, False, False, False)

        # Assign as write
        self.permission.update_user_permission(user, PERMISSIONS.WRITE.name)
        self.assert_permissions(user, True, True, False, False, False)

        # Assign as share
        self.permission.update_user_permission(user, PERMISSIONS.SHARE.name)
        self.assert_permissions(user, True, True, False, False, False)

        # Assign as delete
        self.permission.update_user_permission(user, PERMISSIONS.OWNER.name)
        self.assert_permissions(user, True, True, False, False, False)

    def test_viewer_in_group_permission(self):
        """Check viewer in group permission."""
        user = self.viewer_in_group
        self.assert_permissions(user, True, False, False, False, False)

        # Assign as list
        self.permission.update_group_permission(
            self.group, PERMISSIONS.LIST.name)
        self.assert_permissions(user, True, False, False, False, False)

        # Assign as read
        self.permission.update_group_permission(
            self.group, PERMISSIONS.READ.name)
        self.assert_permissions(user, True, True, False, False, False)

        # Assign as write
        self.permission.update_group_permission(
            self.group, PERMISSIONS.WRITE.name)
        self.assert_permissions(user, True, True, False, False, False)

        # Assign as share
        self.permission.update_group_permission(
            self.group, PERMISSIONS.SHARE.name)
        self.assert_permissions(user, True, True, False, False, False)

        # Assign as delete
        self.permission.update_group_permission(
            self.group, PERMISSIONS.OWNER.name)
        self.assert_permissions(user, True, True, False, False, False)

    def test_public_permission(self):
        """Check non user permission."""
        user = None
        self.assert_permissions(user, False, False, False, False, False)

        self.permission.public_permission = PERMISSIONS.READ.name
        self.permission.save()

        self.assert_permissions(user, True, True, False, False, False)
