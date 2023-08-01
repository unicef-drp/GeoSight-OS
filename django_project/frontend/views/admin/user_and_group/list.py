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
__date__ = '01/08/2023'
__copyright__ = ('Copyright 2023, Unicef')

from django.shortcuts import reverse

from frontend.views.admin._base import AdminBaseView
from geosight.permission.access import RoleSuperAdminRequiredMixin


class UserAndGroupListView(RoleSuperAdminRequiredMixin, AdminBaseView):
    """User Detail View."""

    template_name = 'frontend/admin/user_and_group/list.html'

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'User and Group'

    @property
    def content_title(self):
        """Return content title that used on page title indicator."""
        list_url = reverse('admin-user-and-group-list-view')
        return f'<a href="{list_url}">User and Group</a> '
