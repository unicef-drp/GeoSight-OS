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

import json

from django.shortcuts import get_object_or_404

from frontend.views.dashboard.detail import DashboardDetailView
from frontend.views.login import LoginPageView
from geosight.data.models.dashboard import Dashboard, DashboardEmbed
from geosight.data.serializer.dashboard_embed import DashboardEmbedSerializer


class DashboardDetailEmbedView(DashboardDetailView):
    """Dashboard Detail View."""

    @property
    def embed(self) -> DashboardEmbed:
        """Return embed."""
        return get_object_or_404(
            DashboardEmbed, code=self.kwargs.get('slug', '')
        )

    @property
    def dashboard(self) -> Dashboard:
        """Return dashboard."""
        return self.embed.dashboard

    def get_context_data(self, slug, **kwargs) -> dict:
        """Return context data."""
        context = super().get_context_data(**kwargs)
        embed = self.embed
        context['embed_config'] = json.dumps(
            DashboardEmbedSerializer(embed).data
        )
        return context


class LoginEmbedPageView(LoginPageView):
    """Login Create View."""

    pass
