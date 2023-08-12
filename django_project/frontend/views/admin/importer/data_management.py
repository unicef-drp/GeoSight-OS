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
from geosight.permission.access import RoleContributorRequiredMixin


class DataManagementListView(RoleContributorRequiredMixin, AdminBaseView):
    """Logs Lost View."""

    template_name = 'frontend/admin/importer/data_management.html'

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Data Management'

    @property
    def content_title(self):
        """Return content title that used on page title indicator."""
        data_importer = reverse('admin-importer-create-view')
        logs = reverse('admin-data-management-list-view') + '#Logs'
        return (
            f'<a href="{data_importer}">Data Management</a>'
            '<span>></span>'
            f'<a href="{logs}">Logs</a>'
        )
