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

from django.shortcuts import get_object_or_404, reverse

from frontend.views.admin._base import AdminBaseView
from geosight.importer.models.log import ImporterLog
from geosight.permission.access import RoleContributorRequiredMixin


class ImporterLogDetailView(RoleContributorRequiredMixin, AdminBaseView):
    """ImporterLog Detail View."""

    template_name = 'frontend/admin/importer/log_detail.html'

    @property
    def log(self):
        """Return indicator."""
        return get_object_or_404(
            ImporterLog, id=self.kwargs.get('pk', '')
        )

    def get_context_data(self, **kwargs) -> dict:
        """Get context data."""
        context = super().get_context_data(**kwargs)
        context['obj_id'] = self.log.id
        return context

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Importer Log'

    @property
    def content_title(self):
        """Return content title that used on page title indicator."""
        log = self.log
        data_importer = reverse('admin-importer-create-view')
        logs = reverse('admin-importer-log-list-view')
        log_url = reverse(
            'admin-importer-log-detail-view', args=[log.id]
        )
        return (
            f'<a href="{data_importer}">Data Importer</a>'
            '<span>></span>'
            f'<a href="{logs}">Logs</a>'
            f'<span>></span> '
            f'<a href="{log_url}">{log.importer.__str__()}</a>'
        )
