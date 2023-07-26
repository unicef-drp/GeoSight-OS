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
__date__ = '25/07/2023'
__copyright__ = ('Copyright 2023, Unicef')

from abc import ABC

from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.urls import reverse

from core.models.access_request import UserAccessRequest
from frontend.views.admin._base import AdminBaseView
from geosight.permission.access import RoleContributorRequiredMixin

User = get_user_model()


class AccessRequestDetailView(
    RoleContributorRequiredMixin, AdminBaseView, ABC
):
    """Access Request Detail View."""

    TYPE = UserAccessRequest.RequestType.NEW_USER
    LIST_URL = None

    def get_context_data(self, **kwargs) -> dict:
        """Return context data."""
        context = super().get_context_data(**kwargs)
        obj = get_object_or_404(
            UserAccessRequest, id=self.kwargs.get('pk', ''), type=self.TYPE
        )
        context['id'] = obj.id
        context['LIST_URL'] = self.LIST_URL
        return context


class AccessRequestUserDetailView(AccessRequestDetailView):
    """Access Request Detail View."""

    TYPE = UserAccessRequest.RequestType.NEW_USER
    template_name = 'frontend/admin/access_request/detail/user.html'

    @property
    def LIST_URL(self):
        """Return list URL."""
        return reverse('admin-access-request-user-list-view')

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Request New User'

    @property
    def content_title(self):
        """Return content title that used on page title indicator."""
        return f'<a href="{self.LIST_URL}">Request New User</a> '


class AccessRequestPermissionDetailView(AccessRequestDetailView):
    """Access Request Detail View."""

    TYPE = UserAccessRequest.RequestType.NEW_PERMISSIONS
    template_name = 'frontend/admin/access_request/detail/permission.html'

    @property
    def LIST_URL(self):
        """Return list URL."""
        return reverse('admin-access-request-permission-list-view')

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Request Permission'

    @property
    def content_title(self):
        """Return content title that used on page title indicator."""
        return f'<a href="{self.LIST_URL}">Request Permission</a> '
