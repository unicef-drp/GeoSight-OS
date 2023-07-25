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

from django.shortcuts import reverse

from frontend.views.admin._base import AdminBaseView
from geosight.permission.access import RoleSuperAdminRequiredMixin


class AccessRequestUserListView(RoleSuperAdminRequiredMixin, AdminBaseView):
    """Access Request Detail View."""

    template_name = 'frontend/admin/access_request/list/user.html'

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Request New User'

    @property
    def content_title(self):
        """Return content title that used on page title indicator."""
        list_url = reverse('admin-access-request-user-list-view')
        return f'<a href="{list_url}">Request New User</a> '


class AccessRequestPermissionListView(
    RoleSuperAdminRequiredMixin, AdminBaseView
):
    """Access Request Detail View."""

    template_name = 'frontend/admin/access_request/list/permission.html'

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Request Permission'

    @property
    def content_title(self):
        """Return content title that used on page title indicator."""
        list_url = reverse('admin-access-request-permission-list-view')
        return f'<a href="{list_url}">Request Permission</a> '
