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

from django.db.models.signals import post_save
from django.dispatch import receiver

from geosight.data.models.context_layer import ContextLayer
from geosight.permission.models.default import PermissionDefault
from geosight.permission.models.factory import (
    permission_model_factory,
    user_permission_model_factory,
    group_permission_model_factory,
)

default_permission = PermissionDefault.CONTEXT_LAYER

Permission = permission_model_factory(
    object_model=ContextLayer,
    organization_permissions=default_permission.organization.permissions,
    organization_permission_default=default_permission.organization.default,
    public_permissions=default_permission.public.permissions,
    public_permission_default=default_permission.public.default,
    role_to_edit_level_input=2,  # ROLES.CONTRIBUTOR
)


class ContextLayerPermission(Permission):
    """Resource Permission."""

    pass


UserPermission = user_permission_model_factory(
    object_model=ContextLayerPermission,
    permission_default=default_permission.user.default,
    permissions=default_permission.user.permissions,
)
GroupPermission = group_permission_model_factory(
    object_model=ContextLayerPermission,
    permission_default=default_permission.group.default,
    permissions=default_permission.group.permissions,
)


class ContextLayerUserPermission(UserPermission):
    """UserPermission."""

    pass


class ContextLayerGroupPermission(GroupPermission):
    """GroupPermission."""

    pass


@receiver(post_save, sender=ContextLayer)
def create_resource(sender, instance, created, **kwargs):
    """When resource created."""
    if created:
        ContextLayerPermission.objects.create(obj=instance)


@receiver(post_save, sender=ContextLayer)
def save_resource(sender, instance, **kwargs):
    """When resource saved."""
    instance.permission.save()


@receiver(post_save, sender=ContextLayerPermission)
def save_permission_resource(
        sender, instance: ContextLayerPermission, **kwargs
):
    """When permission resource saved."""
    from geosight.data.models.dashboard import DashboardCachePermissions
    try:
        context_layer = ContextLayer.objects.get(pk=instance.obj.pk)
        dashboard_ids = list(
            context_layer.dashboardcontextlayer_set.values_list(
                'dashboard_id', flat=True
            )
        )
        DashboardCachePermissions.objects.filter(
            dashboard_id__in=dashboard_ids
        ).update(cache=None)
    except ContextLayer.DoesNotExist:
        pass
