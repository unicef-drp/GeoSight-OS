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
__date__ = '15/02/2024'
__copyright__ = ('Copyright 2023, Unicef')

from django.db.models.signals import post_save
from django.dispatch import receiver

from geosight.georepo.models.reference_layer import ReferenceLayerView
from geosight.permission.models.default import PermissionDefault
from geosight.permission.models.factory import (
    permission_model_factory,
    user_permission_model_factory,
    group_permission_model_factory,
)

default_permission = PermissionDefault.REFERENCE_LAYER_VIEW

Permission = permission_model_factory(
    object_model=ReferenceLayerView,
    organization_permissions=default_permission.organization.permissions,
    organization_permission_default=default_permission.organization.default,
    public_permissions=default_permission.public.permissions,
    public_permission_default=default_permission.public.default,
    role_to_edit_level_input=2,  # ROLES.CONTRIBUTOR,
    permissions_with_data_access=True
)


class ReferenceLayerViewPermission(Permission):
    """Resource Permission."""

    pass


UserPermission = user_permission_model_factory(
    object_model=ReferenceLayerViewPermission,
    permission_default=default_permission.user.default,
    permissions=default_permission.user.permissions,
)
GroupPermission = group_permission_model_factory(
    object_model=ReferenceLayerViewPermission,
    permission_default=default_permission.group.default,
    permissions=default_permission.group.permissions,
)


class ReferenceLayerViewUserPermission(UserPermission):
    """UserPermission."""

    pass


class ReferenceLayerViewGroupPermission(GroupPermission):
    """GroupPermission."""

    pass


@receiver(post_save, sender=ReferenceLayerView)
def save_resource(sender, instance, created, **kwargs):
    """When resource created."""
    if created:
        ReferenceLayerViewPermission.objects.get_or_create(obj=instance)
    else:
        try:
            instance.permission.save()
        except Exception:
            ReferenceLayerViewPermission.objects.get_or_create(
                obj=instance
            )
