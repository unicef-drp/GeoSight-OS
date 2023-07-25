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

from django.conf import settings
from django.shortcuts import reverse

from frontend.views._base import BaseView
from geosight.data.models.dashboard import Dashboard


class HomePageView(BaseView):
    """Home Create View."""

    template_name = 'frontend/home.html'

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Home'

    @property
    def content_title(self):
        """Return content title that used on page title indicator."""
        return 'Home'

    def get_context_data(self, **kwargs) -> dict:
        """Return context data."""
        context = super().get_context_data(**kwargs)
        context['dashboards'] = [
            {
                'slug': dashboard.slug,
                'name': dashboard.name,
                'description': dashboard.description,
                'icon': dashboard.icon.url if dashboard.icon else (
                        settings.STATIC_URL + "img/no-image.jpeg"
                ),
                'url': reverse(
                    'dashboard-detail-view',
                    args=[dashboard.slug]
                ),
                'edit_url': reverse(
                    'admin-dashboard-edit-view',
                    args=[dashboard.slug]
                ) if dashboard.permission.has_edit_perm(
                    self.request.user) else ''
            }
            for dashboard in Dashboard.permissions.list(
                self.request.user).order_by('slug')
        ]
        return context
