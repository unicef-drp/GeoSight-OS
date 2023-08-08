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

from frontend.views.admin.access_request.detail import (
    AccessRequestUserDetailView, AccessRequestPermissionDetailView
)
from frontend.views.admin.access_request.list import AccessRequestListView

urlpatterns = [
    url(
        r'^request/user/(?P<pk>\d+)$',
        AccessRequestUserDetailView.as_view(),
        name='admin-access-request-user-detail-view'
    ),
    url(
        r'^request/permission/(?P<pk>\d+)$',
        AccessRequestPermissionDetailView.as_view(),
        name='admin-access-request-permission-detail-view'
    ),
    url(
        r'^request$',
        AccessRequestListView.as_view(),
        name='admin-access-request-list-view'
    ),
]
