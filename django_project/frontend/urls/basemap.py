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
from django.urls import include

from frontend.views.admin.basemap.create import BasemapCreateView
from frontend.views.admin.basemap.edit import (
    BasemapEditView, BasemapEditBatchView
)
from frontend.views.admin.basemap.list import BasemapListView

admin_detail_url = [
    url(
        r'^edit',
        BasemapEditView.as_view(),
        name='admin-basemap-edit-view'
    ),
]
urlpatterns = [
    url(r'^(?P<pk>\d+)/', include(admin_detail_url)),
    url(
        r'^edit/batch',
        BasemapEditBatchView.as_view(),
        name='admin-basemap-edit-batch-view'
    ),
    url(
        r'^create',
        BasemapCreateView.as_view(),
        name='admin-basemap-create-view'
    ),
    url(
        r'^',
        BasemapListView.as_view(),
        name='admin-basemap-list-view'
    ),
]
