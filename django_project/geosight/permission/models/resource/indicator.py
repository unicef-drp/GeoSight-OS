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

from geosight.data.models.indicator import Indicator
from geosight.permission.models.default import PermissionDefault
from geosight.permission.models.factory import (
    permission_model_factory,
    user_permission_model_factory,
    group_permission_model_factory,
)

default_permission = PermissionDefault.INDICATOR

Permission = permission_model_factory(
    object_model=Indicator,
    organization_permissions=default_permission.organization.permissions,
    organization_permission_default=default_permission.organization.default,
    public_permissions=default_permission.public.permissions,
    public_permission_default=default_permission.public.default,
    role_to_edit_level_input=2,  # ROLES.CONTRIBUTOR
    permissions_with_data_access=True
)


class IndicatorPermission(Permission):
    """Resource Permission."""

    pass


UserPermission = user_permission_model_factory(
    object_model=IndicatorPermission,
    permission_default=default_permission.user.default,
    permissions=default_permission.user.permissions,
)
GroupPermission = group_permission_model_factory(
    object_model=IndicatorPermission,
    permission_default=default_permission.group.default,
    permissions=default_permission.group.permissions,
)


class IndicatorUserPermission(UserPermission):
    """UserPermission."""

    pass


class IndicatorGroupPermission(GroupPermission):
    """GroupPermission."""

    pass


@receiver(post_save, sender=Indicator)
def create_resource(sender, instance, created, **kwargs):
    """When resource created."""
    if created:
        IndicatorPermission.objects.create(obj=instance)


@receiver(post_save, sender=Indicator)
def save_resource(sender, instance, **kwargs):
    """When resource saved."""
    instance.permission.save()


@receiver(post_save, sender=IndicatorPermission)
def save_permission_resource(sender, instance: IndicatorPermission, **kwargs):
    """When permission resource saved."""
    from geosight.data.models.dashboard import DashboardCachePermissions
    try:
        indicator = Indicator.objects.get(pk=instance.obj.pk)
        dashboard_ids = list(
            indicator.dashboardindicator_set.values_list(
                'dashboard_id', flat=True
            )
        )
        DashboardCachePermissions.objects.filter(
            dashboard_id__in=dashboard_ids
        ).update(cache=None)
    except Indicator.DoesNotExist:
        pass
