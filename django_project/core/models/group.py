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

from django.contrib.auth.models import Group
from django.db import models

from geosight.permission.models.manager import PermissionManager


class GeosightGroup(Group):
    """Proxy model for group."""

    class Meta:  # noqa: D106
        proxy = True

    objects = models.Manager()
    permissions = PermissionManager()

    @property
    def creator(self):
        """Return creator of permission."""
        return self.permission.creator
