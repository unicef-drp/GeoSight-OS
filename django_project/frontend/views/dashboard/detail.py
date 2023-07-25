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

from django.contrib.auth.views import redirect_to_login
from django.shortcuts import get_object_or_404

from frontend.views.dashboard._base import BaseDashboardView
from geosight.data.models.dashboard import Dashboard
from geosight.permission.access import (
    read_permission_resource, ResourcePermissionDenied
)


class DashboardDetailView(BaseDashboardView):
    """Dashboard Detail View."""

    @property
    def content_title(self):
        """Return content title that used on page title indicator."""
        return 'Dashboard detail'

    @property
    def dashboard(self):
        """Return dashboard."""
        return get_object_or_404(Dashboard, slug=self.kwargs.get('slug', ''))

    @property
    def header_title(self):
        """Return content title that will be show on the header."""
        return self.dashboard.name

    def not_logged_in(self):
        """Return not logged in."""
        return redirect_to_login(self.request.get_full_path())

    def get(self, request, **kwargs):
        """GET function."""
        dashboard = self.dashboard
        try:
            read_permission_resource(dashboard, self.request.user)
        except ResourcePermissionDenied:
            if not self.request.user.is_authenticated:
                return self.not_logged_in()
            else:
                raise ResourcePermissionDenied()
        return super().get(request, **kwargs)

    def get_context_data(self, **kwargs) -> dict:
        """Return context data."""
        context = super().get_context_data(**kwargs)
        dashboard = self.dashboard
        context['dashboard'] = {'id': dashboard.slug}
        return context
