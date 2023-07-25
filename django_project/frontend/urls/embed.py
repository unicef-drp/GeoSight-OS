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

from django.conf.urls import url

from frontend.views.dashboard.detail_embed import (
    DashboardDetailEmbedView, LoginEmbedPageView
)

urlpatterns = [
    url(
        r'login',
        LoginEmbedPageView.as_view(),
        name='login-embed-view'
    ),
    url(
        r'^(?P<slug>[^/]+)',
        DashboardDetailEmbedView.as_view(),
        name='dashboard-detail-embed-view'
    ),
]
