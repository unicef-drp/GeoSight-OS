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

from geosight.permission.api import (
    BasemapPermissionAPI,
    ContextLayerPermissionAPI,
    DashboardPermissionAPI,
    GroupPermissionAPI,
    IndicatorPermissionAPI,
    DataAccessGeneralAPI,
    DataAccessUsersAPI,
    DataAccessGroupsAPI,
    RelatedTablePermissionAPI,
    StylePermissionAPI
)

urlpatterns = [
    url(
        r'^basemap/(?P<pk>\d+)',
        BasemapPermissionAPI.as_view(),
        name='basemap-permission-api'
    ),
    url(
        r'^context-layer/(?P<pk>\d+)',
        ContextLayerPermissionAPI.as_view(),
        name='context-layer-permission-api'
    ),
    url(
        r'^dashboard/(?P<slug>[^/]+)',
        DashboardPermissionAPI.as_view(),
        name='dashboard-permission-api'
    ),
    url(
        r'^group/(?P<pk>\d+)',
        GroupPermissionAPI.as_view(),
        name='group-permission-api'
    ),
    url(
        r'^indicator/(?P<pk>\d+)',
        IndicatorPermissionAPI.as_view(),
        name='indicator-permission-api'
    ),
    url(
        r'^data-access/general',
        DataAccessGeneralAPI.as_view(),
        name='data-access-general-api'
    ),
    url(
        r'^data-access/users',
        DataAccessUsersAPI.as_view(),
        name='data-access-users-api'
    ),
    url(
        r'^data-access/groups',
        DataAccessGroupsAPI.as_view(),
        name='data-access-groups-api'
    ),
    url(
        r'^related-table/(?P<pk>\d+)',
        RelatedTablePermissionAPI.as_view(),
        name='related-table-permission-api'
    ),
    url(
        r'^style/(?P<pk>\d+)',
        StylePermissionAPI.as_view(),
        name='style-permission-api'
    ),
]
