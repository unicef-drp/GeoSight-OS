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

    def __init__(self, message="Don't have access to do the action."):
        """Init class."""
        self.message = message
        super().__init__(self.message)


class PermissionManager(models.Manager):
    """Manager for resource that has permission.

    Make sure the Model override AbstractEditData
    """

    def save_creator(self, obj, user):
        """Save creator of object."""
        try:
            obj.creator = user
            obj.save()
        except AttributeError:
            try:
                obj.permission.creator = user
                obj.permission.save()
            except AttributeError:
                pass

    def get_or_create(
            self, user: User, defaults=None, have_creator=True, **kwargs):
        """Get or create function with user."""
        if have_creator:
            try:
                if not user.profile.is_creator:
                    raise PermissionException()
            except AttributeError:
                raise PermissionException()

        obj, created = super().get_or_create(defaults=defaults, **kwargs)
        if created:
            self.save_creator(obj, user)
        return obj, created

    def create(self, user: User, **kwargs):
        """Create function with user."""
        try:
            if not user.profile.is_creator:
                raise PermissionException()
        except AttributeError:
            raise PermissionException()

        obj = super().create(**kwargs)
        if not obj.creator:
            self.save_creator(obj, user)
        return obj

    def query_by_permission(
            self, user, minimum_permission, minimum_role=None
    ):
        """Query based on the permission."""
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
        """Get list resources by user."""
        return self.query_by_permission(user, PERMISSIONS.LIST)

    def read(self, user: User):
        """Get read resources by user."""
        return self.query_by_permission(user, PERMISSIONS.READ)

    def read_data(self, user: User):
        """Get read data resources by user."""
        return self.query_by_permission(user, PERMISSIONS.READ_DATA)

    def share(self, user: User):
        """Get share resources by user."""
        return self.query_by_permission(user, PERMISSIONS.SHARE)

    def edit(self, user: User):
        """Get read resources by user."""
        try:
            minimum_role = self.first().minimum_edit_role_level
        except AttributeError:
            perm_model = self.model.permission.related.related_model
            minimum_role = perm_model.objects.first().minimum_edit_role_level
        return self.query_by_permission(user, PERMISSIONS.WRITE, minimum_role)

    def edit_data(self, user: User):
        """Get create resources by user."""
        try:
            minimum_role = self.first().minimum_edit_role_level
        except AttributeError:
            perm_model = self.model.permission.related.related_model
            minimum_role = perm_model.objects.first().minimum_edit_role_level
        return self.query_by_permission(
            user, PERMISSIONS.WRITE_DATA, minimum_role
        )

    def delete(self, user: User):
        """Get create resources by user."""
        try:
            minimum_role = self.first().minimum_delete_role_level
        except AttributeError:
            perm_model = self.model.permission.related.related_model
            minimum_role = perm_model.objects.first().minimum_delete_role_level
        return self.query_by_permission(user, PERMISSIONS.OWNER, minimum_role)
