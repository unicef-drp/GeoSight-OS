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
__date__ = '06/06/2024'
__copyright__ = ('Copyright 2023, Unicef')

from cloud_native_gis.models.layer import Layer
from django.contrib.auth import get_user_model
from django.db import models

from geosight.permission.models.manager import (
    PermissionException, PermissionManager
)

User = get_user_model()


class GeosightPermissionManager(PermissionManager):
    """Permission manager for Geosight Cloud Native GIS."""

    def save_creator(self, obj: Layer, user):
        """Save creator of object."""
        obj.created_by = user
        obj.save()

    def create(self, user: User, **kwargs):
        """Create function with user."""
        try:
            if not user.profile.is_creator:
                raise PermissionException()
        except AttributeError:
            raise PermissionException()

        # Add created by in kwargs
        if 'created_by' not in kwargs:
            kwargs['created_by'] = user

        obj = super(PermissionManager, self).create(**kwargs)
        if not obj.creator:
            self.save_creator(obj, user)
        return obj


class CloudNativeGISLayer(Layer):
    """Proxy model for cloud_native_gis layer."""

    class Meta:  # noqa: D106
        proxy = True

    objects = models.Manager()
    permissions = GeosightPermissionManager()

    @property
    def creator(self):
        """Return creator of permission."""
        return self.created_by
