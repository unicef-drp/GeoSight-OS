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

from rest_framework.permissions import BasePermission


class AdminAuthenticationPermission(BasePermission):
    """Authentication just for the admin."""

    def has_permission(self, request, view):
        """For checking if user has permission."""
        user = request.user
        return user.is_authenticated and user.profile.is_admin


class RoleContributorAuthenticationPermission(BasePermission):
    """Authentication just for Role Contributor."""

    def has_permission(self, request, view):
        """For checking if user has permission."""
        user = request.user
        return user.is_authenticated and user.profile.is_contributor


class RoleCreatorAuthenticationPermission(BasePermission):
    """Authentication just for Role Contributor."""

    def has_permission(self, request, view):
        """For checking if user has permission."""
        user = request.user
        return user.is_authenticated and user.profile.is_creator
