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
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

from geosight.georepo.models.reference_layer import ReferenceLayerIndicator
from geosight.permission.models.default import PermissionDefault
from geosight.permission.models.factory import (
    permission_model_factory,
    user_permission_model_factory,
    group_permission_model_factory
)
from geosight.permission.models.manager import PermissionManager

User = get_user_model()
default_permission = PermissionDefault.DATASET

Permission = permission_model_factory(
    object_model=ReferenceLayerIndicator,
    organization_permissions=default_permission.organization.permissions,
    organization_permission_default=default_permission.organization.default,
    public_permissions=default_permission.public.permissions,
    public_permission_default=default_permission.public.default,
    role_to_edit_level_input=2  # ROLES.CONTRIBUTOR
)


class ReferenceLayerIndicatorPermission(Permission):
    """Resource Permission."""

    objects = models.Manager()
    permissions = PermissionManager()

    def check_permission(
            self, target_perm_level: int, user: User = None
    ) -> bool:
        """Check target permission.

        For reference layer indicator:
        Check the permission on indicator first
        If does not have permission, check on dataset level
        """
        from geosight.permission.models.resource.indicator import (
            IndicatorPermission
        )
        """Check target permission."""
        user_perm = self.get_user_perm_level(user)
        if user_perm < target_perm_level:
            # Use indicator permission first
            # Return true if it has permission
            try:
                indicator_perm = IndicatorPermission.objects.get(
                    obj=self.obj.indicator
                )
                permission = indicator_perm.check_permission(
                    target_perm_level, user
                )
                if permission:
                    return True
            except IndicatorPermission.DoesNotExist:
                pass

        user_perm = self.get_user_perm_level(user)
        return user_perm >= target_perm_level


UserPermission = user_permission_model_factory(
    object_model=ReferenceLayerIndicatorPermission,
    permission_default=default_permission.user.default,
    permissions=default_permission.user.permissions,
)
GroupPermission = group_permission_model_factory(
    object_model=ReferenceLayerIndicatorPermission,
    permission_default=default_permission.group.default,
    permissions=default_permission.group.permissions,
)


class ReferenceLayerIndicatorUserPermission(UserPermission):
    """UserPermission."""

    pass


class ReferenceLayerIndicatorGroupPermission(GroupPermission):
    """GroupPermission."""

    pass


@receiver(post_save, sender=ReferenceLayerIndicator)
def create_resource(sender, instance, created, **kwargs):
    """When resource created."""
    if created:
        ReferenceLayerIndicatorPermission.objects.create(obj=instance)


@receiver(post_save, sender=ReferenceLayerIndicator)
def save_resource(sender, instance, **kwargs):
    """When resource saved."""
    instance.permission.save()


# This is The View
class ReferenceLayerIndicatorPermissionView(models.Model):
    """Resource Permission."""

    obj_id = models.IntegerField()
    identifier = models.CharField(
        max_length=256, null=True, blank=True
    )

    objects = models.Manager()
    permissions = PermissionManager()

    class Meta:  # noqa: D106
        managed = False
        db_table = 'v_referencelayer_indicator_permission'
