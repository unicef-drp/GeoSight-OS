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
from geosight.importer.models.log import Importer
from geosight.permission.access import RoleContributorRequiredMixin


class ImporterDetailView(RoleContributorRequiredMixin, AdminBaseView):
    """Importer Detail View."""

    template_name = 'frontend/admin/importer/importer_detail.html'

    @property
    def importer(self):
        """Return indicator."""
        return get_object_or_404(
            Importer, id=self.kwargs.get('pk', '')
        )

    def get_context_data(self, **kwargs) -> dict:
        """Get context data."""
        context = super().get_context_data(**kwargs)
        context['obj_id'] = self.importer.id
        return context

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Importer Log'

    @property
    def content_title(self):
        """Return content title that used on page title indicator."""
        importer = self.importer
        data_importer = reverse('admin-importer-create-view')
        list_url = reverse('admin-scheduled-job-list-view')
        importer_url = reverse(
            'admin-importer-detail-view', args=[importer.id]
        )
        return (
            f'<a href="{data_importer}">Data Importer</a>'
            '<span>></span>'
            f'<a href="{list_url}">Scheduled Jobs</a>'
            f'<span>></span> '
            f'<a href="{importer_url}">{importer.__str__()}</a>'
        )
