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

import json

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.db import models

User = get_user_model()

PERMISSIONS_LENGTH = 16


class PermissionDetail:
    """Class contains role detail that keep the role name."""

    def __init__(self, name: str, level: float):
        """Initiate permission detail.

        name:   Permission name in string
        level:  The level of permission.
                The higher the number the stronger the permission.
        """
        self.name = name
        self.level = level

    def __str__(self):
        return self.name


class PERMISSIONS:
    """Permissions types."""

    NONE = PermissionDetail('None', 0)
    LIST = PermissionDetail('List', 1)
    READ = PermissionDetail('Read', 2)
    READ_DATA = PermissionDetail('Read Data', 2.5)
    WRITE = PermissionDetail('Write', 3)
    WRITE_DATA = PermissionDetail('Write Data', 3.5)
    SHARE = PermissionDetail('Share', 4)
    OWNER = PermissionDetail('Owner', 5)

    def get_level(self, name: str):
        """Return level by name."""
        try:
            return getattr(self, name.upper().replace(' ', '_')).level
        except AttributeError:
            return -1

    def get_permissions(self, minimum: PermissionDetail):
        """Return the list of data."""
        level = minimum.level
        permissions = []
        for name in dir(self):
            attr = getattr(self, name)
            if getattr(self, name).__class__ == PermissionDetail:
                if attr.level >= level:
                    permissions.append(attr.name)
        return permissions


def permission_model_factory(
        object_model,
        organization_permissions: list = None,
        organization_permission_default: str = PERMISSIONS.NONE.name,
        public_permissions: list = None,
        public_permission_default: str = PERMISSIONS.NONE.name,
        role_to_edit_level_input=None,
        role_to_share_level_input=None,
        role_to_delete_level_input=None,
        permissions_with_data_access=False
):
    """Return Permission model."""
    if not public_permissions:
        public_permissions = [
            (PERMISSIONS.NONE.name, PERMISSIONS.NONE.name),
            (PERMISSIONS.READ.name, PERMISSIONS.READ.name),
        ]
    if not organization_permissions:
        organization_permissions = [
            (PERMISSIONS.NONE.name, PERMISSIONS.NONE.name),
            (PERMISSIONS.LIST.name, PERMISSIONS.LIST.name),
            (PERMISSIONS.READ.name, PERMISSIONS.READ.name),
        ]

    # Return permission model
    class Permission(models.Model):
        """Permission Model."""

        role_to_edit_level = role_to_edit_level_input
        role_to_share_level = role_to_share_level_input
        role_to_delete_level = role_to_delete_level_input

        obj = models.OneToOneField(
            object_model, on_delete=models.CASCADE,
            related_name='permission'
        )
        organization_permission = models.CharField(
            max_length=PERMISSIONS_LENGTH,
            default=organization_permission_default,
            choices=organization_permissions
        )

        public_permission = models.CharField(
            max_length=PERMISSIONS_LENGTH,
            default=public_permission_default,
            choices=public_permissions
        )

        class Meta:  # noqa: D106
            abstract = True

        @property
        def resource_creator(self):
            """Return creator of resource."""
            try:
                return self.obj.creator
            except AttributeError:
                try:
                    return self.creator
                except AttributeError:
                    return None

        @property
        def minimum_edit_role_level(self):
            """Return minimum role to edit."""
            from core.models.profile import ROLES
            if not self.role_to_edit_level:
                return ROLES.CREATOR.level
            return self.role_to_edit_level

        @property
        def minimum_share_role_level(self):
            """Return minimum role to edit."""
            from core.models.profile import ROLES
            if not self.role_to_share_level:
                return ROLES.CREATOR.level
            return self.role_to_share_level

        @property
        def minimum_delete_role_level(self):
            """Return minimum role to edit."""
            from core.models.profile import ROLES
            if not self.role_to_delete_level:
                return ROLES.CREATOR.level
            return self.role_to_delete_level

        def update_from_request_data(self, data, user, clean_update=True):
            """Update from data."""
            permission = data.get('permission', None)
            if permission:
                if self.has_share_perm(user):
                    if isinstance(permission, str):
                        permission = json.loads(permission)
                    self.update(permission, clean_update)

        def update(self, data, clean_update=True):
            """Update with new data.

            :param data: data to update
            :type data: dict

            :param clean_update:
                clean update that will delete all permissions not in the data
            :type clean_update: bool
            """
            self.organization_permission = data.get(
                'organization_permission', organization_permission_default
            )

            # Make public permission is optional
            try:
                self.public_permission = data['public_permission']
                self.save()
            except KeyError:
                pass
            try:
                key = 'user_permissions'
                permissions = self.user_permissions

                if not clean_update:
                    deleted_permissions = data.get(f'{key}_deleted', None)
                    if deleted_permissions:
                        permissions.filter(
                            user_id__in=deleted_permissions
                        ).delete()

                user_ids = [user['id'] for user in data[key]]
                if clean_update:
                    permissions.exclude(user_id__in=user_ids).delete()

                for user in data[key]:
                    perm, crt = permissions.model.objects.get_or_create(
                        obj=self, user_id=user['id']
                    )
                    perm.permission = user['permission']
                    perm.save()
            except KeyError:
                pass

            try:
                key = 'group_permissions'
                permissions = self.group_permissions

                if not clean_update:
                    deleted_permissions = data.get(
                        f'{key}_deleted', None
                    )
                    if deleted_permissions:
                        permissions.filter(
                            group_id__in=deleted_permissions
                        ).delete()

                group_ids = [group['id'] for group in data[key]]
                if clean_update:
                    permissions.exclude(group_id__in=group_ids).delete()

                for group in data[key]:
                    perm, crt = permissions.model.objects.get_or_create(
                        obj=self, group_id=group['id']
                    )
                    perm.permission = group['permission']
                    perm.save()
            except KeyError:
                pass

            return

        def update_user_permission(self, user: User, permission: str):
            """Update user permission."""
            perm, created = self.user_permissions.model.objects.get_or_create(
                obj=self, user=user
            )
            perm.permission = permission
            perm.save()

        def update_group_permission(self, group: Group, permission: str):
            """Update group permission."""
            perm, created = self.group_permissions.model.objects.get_or_create(
                obj=self, group=group
            )
            perm.permission = permission
            perm.save()

        def get_user_perm_level(self, user: User = None):
            """Get user permission."""
            if user and not user.is_authenticated:
                user = None

            if user:
                # Return true if superuser or super admin
                if user.profile.is_admin:
                    return PERMISSIONS.OWNER.level

                # Return true if creator
                if user == self.resource_creator:
                    return PERMISSIONS.OWNER.level

                try:
                    if user == self.obj.creator:
                        return PERMISSIONS.OWNER.level
                except AttributeError:
                    pass

            user_level = -1

            # Get from public permission
            public_perm = PERMISSIONS().get_level(self.public_permission)
            if public_perm > user_level:
                user_level = public_perm

            # check if user permission
            if user:
                # Get from organisation permissions
                org_perm = PERMISSIONS().get_level(
                    self.organization_permission)
                if org_perm > user_level:
                    user_level = org_perm

                # Get specific user permission
                user_perm = self.user_permissions.filter(user=user).first()
                if user_perm:
                    user_perm = PERMISSIONS().get_level(user_perm.permission)
                    if user_perm > user_level:
                        user_level = user_perm

                # Get specific group permission for the user
                user_groups = list(user.groups.values_list('id', flat=True))
                for group_perm in self.group_permissions.filter(
                        group_id__in=user_groups):
                    group_perm = PERMISSIONS().get_level(group_perm.permission)
                    if group_perm > user_level:
                        user_level = group_perm

            return user_level

        def check_permission(
                self, target_perm_level: int, user: User = None
        ) -> bool:
            """Check target permission."""
            user_perm = self.get_user_perm_level(user)
            return user_perm >= target_perm_level

        # all permission attribute
        def has_list_perm(self, user: User = None):
            """Is has list permission."""
            return self.check_permission(PERMISSIONS.LIST.level, user)

        def has_read_perm(self, user: User = None):
            """Is has read permission."""
            return self.check_permission(PERMISSIONS.READ.level, user)

        def has_read_data_perm(self, user: User = None):
            """Is has read permission."""
            return self.check_permission(PERMISSIONS.READ_DATA.level, user)

        # Need to check minimum role to edit
        def has_edit_perm(self, user: User = None):
            """Is has write permission."""
            from core.models.profile import ROLES
            if not user:
                return False
            user_role = ROLES().get_user_level(user)
            if user_role < self.minimum_edit_role_level:
                return False
            return self.check_permission(PERMISSIONS.WRITE.level, user)

        def has_edit_data_perm(self, user: User = None):
            """Is has write permission."""
            from core.models.profile import ROLES
            if not user:
                return False
            user_role = ROLES().get_user_level(user)
            if user_role < self.minimum_edit_role_level:
                return False
            return self.check_permission(PERMISSIONS.WRITE_DATA.level, user)

        def has_share_perm(self, user: User = None):
            """Is has share permission."""
            from core.models.profile import ROLES
            if not user:
                return False
            user_role = ROLES().get_user_level(user)
            if user_role < self.minimum_share_role_level:
                return False
            return self.check_permission(PERMISSIONS.SHARE.level, user)

        def has_delete_perm(self, user: User = None):
            """Is has write permission."""
            from core.models.profile import ROLES
            if not user:
                return False
            user_role = ROLES().get_user_level(user)
            if user_role < self.minimum_delete_role_level:
                return False
            return self.check_permission(PERMISSIONS.OWNER.level, user)

        def all_permission(self, user: User = None):
            """Return all permissions."""
            from core.models.profile import ROLES
            if not user or not user.is_authenticated:
                user_role = -1
                user_perm = -1
                if self.public_permission == PERMISSIONS.READ.name:
                    user_role = ROLES.VIEWER.level
                    user_perm = PERMISSIONS.READ.level
                elif self.public_permission == PERMISSIONS.READ_DATA.name:
                    user_role = ROLES.VIEWER.level
                    user_perm = PERMISSIONS.READ_DATA.level
            else:
                user_role = ROLES().get_user_level(user)
                user_perm = self.get_user_perm_level(user)

            permission = {}
            permission['list'] = user_perm >= PERMISSIONS.LIST.level
            permission['read'] = user_perm >= PERMISSIONS.READ.level
            if permissions_with_data_access:
                permission['read_data'] = \
                    user_perm >= PERMISSIONS.READ_DATA.level
            permission['edit'] = \
                user_role >= self.minimum_edit_role_level and \
                user_perm >= PERMISSIONS.WRITE.level  # noqa: E127
            if permissions_with_data_access:
                permission['edit_data'] = \
                    user_role >= self.minimum_edit_role_level and \
                    user_perm >= PERMISSIONS.WRITE_DATA.level  # noqa: E127
            permission['share'] = \
                user_role >= self.minimum_share_role_level and \
                user_perm >= PERMISSIONS.SHARE.level  # noqa: E127
            permission['delete'] = \
                user_role >= self.minimum_delete_role_level and \
                user_perm >= PERMISSIONS.OWNER.level  # noqa: E127
            return permission

    return Permission


def user_permission_model_factory(
        object_model,
        permissions: list = None,
        permission_default: str = PERMISSIONS.NONE.name
):
    """Return UserPermission model."""
    if not permissions:
        permissions = [
            (PERMISSIONS.NONE.name, PERMISSIONS.NONE.name),
            (PERMISSIONS.LIST.name, PERMISSIONS.LIST.name),
            (PERMISSIONS.READ.name, PERMISSIONS.READ.name),
            (PERMISSIONS.WRITE.name, PERMISSIONS.WRITE.name),
            (PERMISSIONS.SHARE.name, PERMISSIONS.SHARE.name),
            (PERMISSIONS.OWNER.name, PERMISSIONS.OWNER.name),
        ]

    # Return user permission model
    class UserPermission(models.Model):
        """Permission for specific user."""

        obj = models.ForeignKey(
            object_model, on_delete=models.CASCADE,
            related_name='user_permissions'
        )
        user = models.ForeignKey(User, on_delete=models.CASCADE)
        permission = models.CharField(
            max_length=PERMISSIONS_LENGTH,
            default=permission_default,
            choices=permissions
        )

        class Meta:  # noqa: D106
            unique_together = ('obj', 'user')
            abstract = True

    return UserPermission


def group_permission_model_factory(
        object_model,
        permissions: list = None,
        permission_default: str = PERMISSIONS.NONE.name
):
    """Return PermissionGroup model."""
    if not permissions:
        permissions = [
            (PERMISSIONS.NONE.name, PERMISSIONS.NONE.name),
            (PERMISSIONS.LIST.name, PERMISSIONS.LIST.name),
            (PERMISSIONS.READ.name, PERMISSIONS.READ.name),
            (PERMISSIONS.WRITE.name, PERMISSIONS.WRITE.name),
            (PERMISSIONS.SHARE.name, PERMISSIONS.SHARE.name),
            (PERMISSIONS.OWNER.name, PERMISSIONS.OWNER.name),
        ]

    # Return group permission model
    class GroupPermission(models.Model):
        """Permission for specific group."""

        obj = models.ForeignKey(
            object_model, on_delete=models.CASCADE,
            related_name='group_permissions'
        )
        group = models.ForeignKey(Group, on_delete=models.CASCADE)
        permission = models.CharField(
            max_length=PERMISSIONS_LENGTH,
            default=permission_default,
            choices=permissions
        )

        class Meta:  # noqa: D106
            unique_together = ('obj', 'group')
            abstract = True

    return GroupPermission
