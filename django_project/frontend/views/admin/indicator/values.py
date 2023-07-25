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
from geosight.data.models.indicator import Indicator
from geosight.permission.access import (
    RoleContributorRequiredMixin, read_permission_resource
)


class IndicatorValueListView(RoleContributorRequiredMixin, AdminBaseView):
    """Indicator Detail View."""

    template_name = 'frontend/admin/indicator/values.html'

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Indicator Values'

    @property
    def content_title(self):
        """Return content title that used on page title indicator."""
        indicator = get_object_or_404(
            Indicator, id=self.kwargs.get('pk', '')
        )
        list_url = reverse('admin-indicator-list-view')
        edit_url = reverse('admin-indicator-edit-view', args=[indicator.id])
        return (
            f'<a href="{list_url}">Indicators</a> '
            f'<span>></span> '
            f'<a href="{edit_url}">{indicator.__str__()}</a> '
            f'<span>></span> '
            '<a>Values</a>'
        )

    def get_context_data(self, **kwargs) -> dict:
        """Return context data."""
        context = super().get_context_data(**kwargs)
        indicator = get_object_or_404(
            Indicator, id=self.kwargs.get('pk', '')
        )
        read_permission_resource(indicator, self.request.user)
        context.update({'indicator_id': indicator.id})
        return context
