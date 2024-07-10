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
__date__ = '22/06/2024'
__copyright__ = ('Copyright 2023, Unicef')

import factory
from django.contrib.auth import get_user_model
from django.test.testcases import TestCase

from core.models.profile import ROLES
from core.tests.model_factories import GroupF, create_user
from geosight.cloud_native_gis.models import (
    CloudNativeGISLayer
)
from geosight.permission.models.factory import PERMISSIONS
from geosight.permission.models.manager import PermissionException

User = get_user_model()


class CloudNativeGISLayerPermissionTest(TestCase):
    """Test for Permission Test."""

    def create_resource(self, user):
        """Create resource function."""
        return CloudNativeGISLayer.permissions.create(
            user=user,
            name=factory.Sequence(
                lambda n: 'Group {}'.format(n)
            )
        )

    def get_resources(self, user):
        """Create resource function."""
        return CloudNativeGISLayer.permissions.list(user)

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
        self.assert_permissions(user, True, True, False, False, False)

        # Assign as list
        self.permission.update_user_permission(user, PERMISSIONS.LIST.name)
        self.assert_permissions(user, True, True, False, False, False)

        # Assign as read
        self.permission.update_user_permission(user, PERMISSIONS.READ.name)
        self.assert_permissions(user, True, True, False, False, False)

        # Assign as read data
        self.permission.update_user_permission(
            user, PERMISSIONS.READ_DATA.name
        )
        self.assert_permissions(user, True, True, False, False, False)

        # Assign as write
        self.permission.update_user_permission(user, PERMISSIONS.WRITE.name)
        self.assert_permissions(user, True, True, True, False, False)

        # Assign as write data
        self.permission.update_user_permission(
            user, PERMISSIONS.WRITE_DATA.name
        )
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
        self.assert_permissions(user, True, True, False, False, False)

        # Assign as list
        self.permission.update_user_permission(user, PERMISSIONS.LIST.name)
        self.assert_permissions(user, True, True, False, False, False)

        # Assign as read
        self.permission.update_user_permission(user, PERMISSIONS.READ.name)
        self.assert_permissions(user, True, True, False, False, False)

        # Assign as read data
        self.permission.update_user_permission(
            user, PERMISSIONS.READ_DATA.name
        )
        self.assert_permissions(user, True, True, False, False, False)

        # Assign as write
        self.permission.update_user_permission(user, PERMISSIONS.WRITE.name)
        self.assert_permissions(user, True, True, True, False, False)

        # Assign as write data
        self.permission.update_user_permission(
            user, PERMISSIONS.WRITE_DATA.name
        )
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
        self.assert_permissions(user, True, True, False, False, False)

        # Assign as list
        self.permission.update_user_permission(user, PERMISSIONS.LIST.name)
        self.assert_permissions(user, True, True, False, False, False)

        # Assign as read
        self.permission.update_user_permission(user, PERMISSIONS.READ.name)
        self.assert_permissions(user, True, True, False, False, False)

        # Assign as read data
        self.permission.update_user_permission(
            user, PERMISSIONS.READ_DATA.name
        )
        self.assert_permissions(user, True, True, False, False, False)

        # Assign as write
        self.permission.update_user_permission(user, PERMISSIONS.WRITE.name)
        self.assert_permissions(user, True, True, False, False, False)

        # Assign as write data
        self.permission.update_user_permission(
            user, PERMISSIONS.WRITE_DATA.name
        )
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
        self.assert_permissions(user, True, True, False, False, False)

        # Assign as list
        self.permission.update_group_permission(
            self.group, PERMISSIONS.LIST.name)
        self.assert_permissions(user, True, True, False, False, False)

        # Assign as read
        self.permission.update_group_permission(
            self.group, PERMISSIONS.READ.name)
        self.assert_permissions(user, True, True, False, False, False)

        # Assign as read data
        self.permission.update_group_permission(
            self.group, PERMISSIONS.READ_DATA.name)
        self.assert_permissions(user, True, True, False, False, False)

        # Assign as write
        self.permission.update_group_permission(
            self.group, PERMISSIONS.WRITE.name)
        self.assert_permissions(user, True, True, False, False, False)

        # Assign as write data
        self.permission.update_group_permission(
            self.group, PERMISSIONS.WRITE_DATA.name)
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
        self.assert_permissions(user, True, True, False, False, False)

        self.permission.public_permission = PERMISSIONS.READ.name
        self.permission.save()

        self.assert_permissions(user, True, True, False, False, False)
