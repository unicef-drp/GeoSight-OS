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
from django.core.exceptions import FieldError
from django.db import models
from django.db.models import Q

from geosight.permission.models.factory import PERMISSIONS

User = get_user_model()


class PermissionException(Exception):
    """Exception raised error of permission."""

    def __init__(  # noqa: DOC101, DOC103
            self, message="Don't have access to do the action."
    ):
        """Init class."""
        self.message = message
        super().__init__(self.message)


class PermissionManager(models.Manager):
    """Manager for resource that has permission.

    Make sure the Model override AbstractEditData
    """

    def save_creator(self, obj, user):
        """
        Save the creator of an object.

        Attempts to set the creator field on the object itself, or if that
        fails, on the object's permission attribute.

        :param obj: The object to set the creator for.
        :type obj: django.db.models.Model

        :param user: The user to set as creator.
        :type user: User
        """
        try:
            obj.creator = user
            obj.save()
        except AttributeError:
            try:
                obj.permission.creator = user
                obj.permission.save()
            except AttributeError:
                pass

    def get_or_create(  # noqa: DOC103
            self, user: User, defaults=None, have_creator=True, **kwargs):
        """
        Get or create an object with user permission validation.

        Retrieves an existing object or creates a new one with the given
        parameters. Validates user permissions and sets the creator if
        the object is newly created.

        :param user: The user attempting to get or create the object.
        :type user: User

        :param defaults: Default values for creating a new object.
        :type defaults: dict

        :param have_creator: Whether to check if user has creator permission.
        :type have_creator: bool

        :param kwargs: Additional keyword arguments for object lookup/creation.
        :type kwargs: dict

        :raises PermissionException: If user lacks creator permission.

        :return: Tuple of (object, created) where created is a boolean.
        :rtype: tuple
        """
        if have_creator:
            try:
                if not user.profile.is_creator:
                    raise PermissionException()
            except AttributeError:
                raise PermissionException()

        # Check if model has exclude_data
        if hasattr(self.model, 'check_data'):
            self.model.check_data(kwargs, user)

        obj, created = super().get_or_create(defaults=defaults, **kwargs)
        if created:
            self.save_creator(obj, user)
        return obj, created

    def create(self, user: User, **kwargs):  # noqa: DOC103
        """
        Create a new object with user permission validation.

        Creates a new object with the given parameters after validating
        the user has creator permissions. Sets the creator field on the
        newly created object.

        :param user: The user attempting to create the object.
        :type user: User

        :param kwargs: Keyword arguments for object creation.
        :type kwargs: dict

        :raises PermissionException: If user lacks creator permission.

        :return: The newly created object.
        :rtype: django.db.models.Model
        """
        try:
            if not user.profile.is_creator:
                raise PermissionException()
        except AttributeError:
            raise PermissionException()

        # Check if model has exclude_data
        if hasattr(self.model, 'check_data'):
            self.model.check_data(kwargs, user)

        obj = super().create(**kwargs)
        if not obj.creator:
            self.save_creator(obj, user)
        return obj

    def query_by_permission(
            self, user, minimum_permission, minimum_role=None
    ):
        """
        Query objects based on user permissions.

        Filters objects based on the user's permission level and role.
        Administrators see all objects. Other users see only objects they
        have permission to access through direct ownership, public
        permissions, user-specific permissions, or group permissions.

        :param user: The user to check permissions for.
        :type user: User

        :param minimum_permission: The minimum permission level required.
        :type minimum_permission: str

        :param minimum_role: Optional minimum role level required.
        :type minimum_role: int

        :return: QuerySet of objects the user has permission to access.
        :rtype: django.db.models.QuerySet
        """
        from core.models.profile import ROLES
        from geosight.georepo.models.reference_layer import (
            ReferenceLayerIndicator
        )
        from geosight.data.models.indicator import Indicator
        try:
            if user.profile.is_admin:
                return self.all()
        except AttributeError:
            user = None

        # If has minimum role
        if minimum_role:
            if not user:
                return self.none()

            user_role = ROLES().get_user_level(user)
            if user_role < minimum_role:
                return self.none()

        permissions = PERMISSIONS().get_permissions(minimum_permission)

        groups = []
        if user:
            groups = user.groups.all()

        permission_query = self
        try:
            _ = self.model.minimum_delete_role_level  # noqa: F841
        except AttributeError:
            permission_model = self.model.permission.related.related_model
            permission_query = permission_model.objects

        # Check permission query
        if user:
            if self.model.__name__ == 'ReferenceLayerIndicatorPermission':
                indicators = Indicator.permissions.delete(
                    user=user
                ).values_list('id', flat=True)
                permission_query = permission_query.filter(
                    Q(obj__indicator__id__in=indicators) |
                    Q(public_permission__in=permissions) |
                    Q(
                        Q(user_permissions__user=user) &
                        Q(user_permissions__permission__in=permissions)
                    ) |
                    Q(
                        Q(group_permissions__group__in=groups) &
                        Q(group_permissions__permission__in=permissions)
                    )
                )
            else:
                try:
                    permission_query = permission_query.filter(
                        Q(creator=user) |
                        Q(public_permission__in=permissions) |
                        Q(
                            Q(user_permissions__user=user) &
                            Q(user_permissions__permission__in=permissions)
                        ) |
                        Q(
                            Q(group_permissions__group__in=groups) &
                            Q(group_permissions__permission__in=permissions)
                        )
                    )
                except FieldError:
                    permission_query = permission_query.filter(
                        Q(public_permission__in=permissions) |
                        Q(
                            Q(user_permissions__user=user) &
                            Q(user_permissions__permission__in=permissions)
                        ) |
                        Q(
                            Q(group_permissions__group__in=groups) &
                            Q(group_permissions__permission__in=permissions)
                        )
                    )
        else:
            permission_query = permission_query.filter(
                Q(public_permission__in=permissions)
            )

        # Return query
        try:
            _ = self.model.minimum_delete_role_level  # noqa: F841
            return permission_query
        except AttributeError:
            query = Q(
                id__in=permission_query.values_list('obj_id', flat=True)
            )
            try:
                return self.filter(Q(creator=user) | query)
            except FieldError:
                if self.model == ReferenceLayerIndicator:
                    return self.filter(
                        Q(
                            indicator__in=
                            Indicator.permissions.query_by_permission(
                                user, minimum_permission, minimum_role
                            )
                        ) | query
                    )
                return self.filter(query)

    def list(self, user: User):
        """
        Get resources the user can list.

        :param user: The user to check permissions for.
        :type user: User

        :return: QuerySet of listable resources.
        :rtype: django.db.models.QuerySet
        """
        return self.query_by_permission(user, PERMISSIONS.LIST)

    def read(self, user: User):
        """
        Get resources the user can read.

        :param user: The user to check permissions for.
        :type user: User

        :return: QuerySet of readable resources.
        :rtype: django.db.models.QuerySet
        """
        return self.query_by_permission(user, PERMISSIONS.READ)

    def read_data(self, user: User):
        """
        Get resources the user can read data from.

        :param user: The user to check permissions for.
        :type user: User

        :return: QuerySet of resources with readable data.
        :rtype: django.db.models.QuerySet
        """
        return self.query_by_permission(user, PERMISSIONS.READ_DATA)

    def share(self, user: User):
        """
        Get resources the user can share with others.

        :param user: The user to check permissions for.
        :type user: User

        :return: QuerySet of shareable resources.
        :rtype: django.db.models.QuerySet
        """
        return self.query_by_permission(user, PERMISSIONS.SHARE)

    def edit(self, user: User):
        """
        Get resources the user can edit.

        :param user: The user to check permissions for.
        :type user: User

        :return: QuerySet of editable resources.
        :rtype: django.db.models.QuerySet
        """
        try:
            minimum_role = self.first().minimum_edit_role_level
        except AttributeError:
            perm_model = self.model.permission.related.related_model
            minimum_role = perm_model.objects.first().minimum_edit_role_level
        return self.query_by_permission(user, PERMISSIONS.WRITE, minimum_role)

    def edit_data(self, user: User):
        """
        Get resources the user can edit data for.

        :param user: The user to check permissions for.
        :type user: User

        :return: QuerySet of resources with editable data.
        :rtype: django.db.models.QuerySet
        """
        try:
            minimum_role = self.first().minimum_edit_role_level
        except AttributeError:
            perm_model = self.model.permission.related.related_model
            minimum_role = perm_model.objects.first().minimum_edit_role_level
        return self.query_by_permission(
            user, PERMISSIONS.WRITE_DATA, minimum_role
        )

    def delete(self, user: User):
        """
        Get resources the user can delete.

        :param user: The user to check permissions for.
        :type user: User

        :return: QuerySet of deletable resources.
        :rtype: django.db.models.QuerySet
        """
        try:
            minimum_role = self.first().minimum_delete_role_level
        except AttributeError:
            perm_model = self.model.permission.related.related_model
            minimum_role = perm_model.objects.first().minimum_delete_role_level
        return self.query_by_permission(user, PERMISSIONS.OWNER, minimum_role)
