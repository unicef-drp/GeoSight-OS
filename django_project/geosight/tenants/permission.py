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
__date__ = '28/08/2024'
__copyright__ = ('Copyright 2023, Unicef')

from rest_framework.permissions import BasePermission

from geosight.tenants.utils import is_public_tenant


class AccessedJustByPublicTenant(BasePermission):
    """Allows access only to public tenant."""

    def has_permission(self, request, view):
        """Check if tenant is public, give permission to request."""
        return is_public_tenant(request)
