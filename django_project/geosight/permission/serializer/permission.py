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

from geosight.permission.models.factory import PERMISSIONS


class PermissionSerializer:
    """Serializer for Permission."""

    def __init__(  # noqa DOC103
            self, obj, users_permissions=None, group_permissions=None
    ):
        """
        Initialize permission serializer for an object.

        This constructor sets up user and group permission data related
        to the given object. It also attempts to identify the object's creator.

        :param obj: The object whose permissions will be serialized
        :type obj: Any
        :param users_permissions:
            Optional queryset of user permissions to override default
        :type users_permissions: QuerySet or None
        :param group_permissions:
            Optional queryset of group permissions to override default
        :type group_permissions: QuerySet or None
        """
        self.obj = obj
        try:
            self.creator = obj.obj.creator
        except AttributeError:
            try:
                self.creator = obj.creator
            except AttributeError:
                self.creator = None

        # Check user permissions init
        self.user_permissions = obj.user_permissions.exclude(
            user=self.creator
        )
        if users_permissions:
            try:
                self.user_permissions = users_permissions.select_related(
                    'user'
                )
            except AttributeError:
                self.user_permissions = users_permissions

        # Check group permission init
        self.group_permissions = obj.group_permissions.all()
        if group_permissions:
            self.group_permissions = group_permissions

    @property
    def data(self):
        """Serialize the data."""
        obj = self.obj
        creator = self.creator
        user_permissions = []
        if creator:
            user_permissions.append(
                {
                    'id': creator.id,
                    'username': creator.username,
                    'full_name': creator.get_full_name(),
                    'first_name': creator.first_name,
                    'last_name': creator.last_name,
                    'email': creator.email,
                    'role': creator.profile.role,
                    'permission': PERMISSIONS.OWNER.name,
                    'creator': True
                }
            )
        user_permissions += [
            {
                'id': user_permission.user.id,
                'username': user_permission.user.username,
                'first_name': user_permission.user.first_name,
                'last_name': user_permission.user.last_name,
                'full_name': user_permission.user.get_full_name(),
                'email': user_permission.user.email,
                'role': user_permission.user.profile.role,
                'permission': user_permission.permission
            } for user_permission in self.user_permissions
        ]
        group_permissions = [
            {
                'id': group_permission.group.id,
                'name': group_permission.group.name,
                'permission': group_permission.permission
            } for group_permission in self.group_permissions
        ]

        org_perm_choices = obj.get_organization_permission_display.keywords[
            'field'].choices
        public_perm_choices = obj.get_public_permission_display.keywords[
            'field'].choices
        user_perm_choices = obj.user_permissions.model.permission.field.choices
        grp_perm_choices = obj.group_permissions.model.permission.field.choices

        return {
            'organization_permission': obj.organization_permission,
            'public_permission': obj.public_permission,
            'user_permissions': user_permissions,
            'group_permissions': group_permissions,
            'choices': {
                'organization_permission': org_perm_choices,
                'public_permission': public_perm_choices,
                'user_permission': user_perm_choices,
                'group_permission': grp_perm_choices,
            },

        }
