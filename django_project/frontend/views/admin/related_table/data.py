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
from geosight.data.models.related_table import RelatedTable
from geosight.permission.access import (
    RoleContributorRequiredMixin, read_data_permission_resource
)


class RelatedTableDataView(RoleContributorRequiredMixin, AdminBaseView):
    """RelatedTable Data View."""

    template_name = 'frontend/admin/related_table/data.html'

    @property
    def related_table(self):
        """Return indicator."""
        return get_object_or_404(
            RelatedTable, id=self.kwargs.get('pk', '')
        )

    def get_context_data(self, **kwargs) -> dict:
        """Get context data."""
        context = super().get_context_data(**kwargs)
        context['obj_id'] = self.related_table.id
        return context

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Related Tables'

    @property
    def content_title(self):
        """Return content title that used on page title indicator."""
        related_table = self.related_table
        read_data_permission_resource(related_table, self.request.user)
        list_url = reverse('admin-related-table-list-view')
        data_url = reverse(
            'admin-related-table-data-view', args=[related_table.id]
        )
        return (
            f'<a href="{list_url}">Related Tables</a>'
            f'<span>></span> '
            f'{related_table.__str__()} '
            f'<span>></span> '
            f'<a href="{data_url}">Data</a> '
        )
