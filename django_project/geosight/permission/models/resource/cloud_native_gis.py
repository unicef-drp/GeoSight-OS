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

from cloud_native_gis.models.layer import Layer
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

from core.models.general import AbstractEditData
from geosight.cloud_native_gis.models import (
    CloudNativeGISLayer
)
from geosight.permission.models.default import PermissionDefault
from geosight.permission.models.factory import (
    permission_model_factory,
    user_permission_model_factory,
    group_permission_model_factory,
)
from geosight.permission.models.manager import PermissionManager

default_permission = PermissionDefault.CLOUD_NATIVE_GIS_LAYER

Permission = permission_model_factory(
    object_model=CloudNativeGISLayer,
    organization_permissions=default_permission.organization.permissions,
    organization_permission_default=default_permission.organization.default,
    public_permissions=default_permission.public.permissions,
    public_permission_default=default_permission.public.default,
    role_to_edit_level_input=2,  # ROLES.CONTRIBUTOR
)


class CloudNativeGISLayerPermission(Permission, AbstractEditData):
    """Resource Permission."""

    objects = models.Manager()
    permissions = PermissionManager()


UserResourcePermission = user_permission_model_factory(
    object_model=CloudNativeGISLayerPermission,
    permission_default=default_permission.user.default,
    permissions=default_permission.user.permissions,
)
GroupResourcePermission = group_permission_model_factory(
    object_model=CloudNativeGISLayerPermission,
    permission_default=default_permission.group.default,
    permissions=default_permission.group.permissions,
)


class CloudNativeGISLayerUserPermission(UserResourcePermission):
    """UserPermission."""

    pass


class CloudNativeGISLayerGroupPermission(GroupResourcePermission):
    """CloudNativeGISLayerPermission."""

    pass


@receiver(post_save, sender=Layer)
@receiver(post_save, sender=CloudNativeGISLayer)
def create_resource(sender, instance, created, **kwargs):
    """When resource created."""
    if created:
        CloudNativeGISLayerPermission.objects.get_or_create(obj=instance)


@receiver(post_save, sender=Layer)
def save_resource(sender, instance, **kwargs):
    """When resource saved."""
    instance.permission.save()
