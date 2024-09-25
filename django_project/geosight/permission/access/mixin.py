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

from braces.views import LoginRequiredMixin as BracerLoginRequiredMixin
from django.contrib.auth.mixins import LoginRequiredMixin
from django.core.exceptions import PermissionDenied
from django.utils.translation import gettext_lazy as _
from rest_framework import status


class RedirectLoginRequiredMixin(LoginRequiredMixin):
    """Custom login required mixin."""

    def handle_no_permission(self):
        """Handle no permission."""
        return BracerLoginRequiredMixin().handle_no_permission(self.request)


class ResourcePermissionDenied(PermissionDenied):
    """Permission denied for resource."""

    status_code = status.HTTP_403_FORBIDDEN
    default_detail = _("You don't have permission to access this resource")
    detail = _("You don't have permission to access this resource")
    default_code = 'error'


class RoleLocalDatasetManagerRequiredMixin(RedirectLoginRequiredMixin):
    """Mixin allowing Contributor."""

    def dispatch(self, request, *args, **kwargs):
        """Dispatch the permission."""
        if not request.user.is_authenticated:
            return self.handle_no_permission()

        user = request.user
        if user.is_authenticated and user.profile.is_admin:
            return super().dispatch(request, *args, **kwargs)
        raise ResourcePermissionDenied


class RoleContributorRequiredMixin(RedirectLoginRequiredMixin):
    """Mixin allowing Contributor."""

    def dispatch(self, request, *args, **kwargs):
        """Dispatch the permission."""
        if not request.user.is_authenticated:
            return self.handle_no_permission()

        user = request.user
        if user.is_authenticated and user.profile.is_contributor:
            return super().dispatch(request, *args, **kwargs)
        raise ResourcePermissionDenied


class RoleCreatorRequiredMixin(RedirectLoginRequiredMixin):
    """Mixin allowing Creator."""

    def dispatch(self, request, *args, **kwargs):
        """Dispatch the permission."""
        if not request.user.is_authenticated:
            return self.handle_no_permission()

        user = request.user
        if user.is_authenticated and user.profile.is_creator:
            return super().dispatch(request, *args, **kwargs)
        raise ResourcePermissionDenied


class RoleSuperAdminRequiredMixin(RedirectLoginRequiredMixin):
    """Mixin allowing Super Admin."""

    def dispatch(self, request, *args, **kwargs):
        """Dispatch the permission."""
        if not request.user.is_authenticated:
            return self.handle_no_permission()

        user = request.user
        if user.is_authenticated and user.profile.is_admin:
            return super().dispatch(request, *args, **kwargs)
        raise ResourcePermissionDenied


def read_permission_resource(resource, user):
    """Read permission resource."""
    if not user.is_authenticated:
        user = None
    if not resource.permission.has_read_perm(user):
        raise ResourcePermissionDenied


def read_data_permission_resource(resource, user):
    """Edit permission resource."""
    if not user.is_authenticated:
        user = None
    if not resource.permission.has_read_data_perm(user):
        raise ResourcePermissionDenied


def edit_permission_resource(resource, user):
    """Edit permission resource."""
    if not user.is_authenticated:
        user = None
    if not resource.permission.has_edit_perm(user):
        raise ResourcePermissionDenied


def edit_data_permission_resource(resource, user):
    """Edit permission resource."""
    if not user.is_authenticated:
        user = None
    if not resource.permission.has_edit_data_perm(user):
        raise ResourcePermissionDenied


def share_permission_resource(resource, user):
    """Share permission resource."""
    if not user.is_authenticated:
        user = None
    if not resource.permission.has_share_perm(user):
        raise ResourcePermissionDenied


def delete_permission_resource(resource, user):
    """Delete permission resource."""
    if not user.is_authenticated:
        user = None
    if not resource.permission.has_delete_perm(user):
        raise ResourcePermissionDenied
