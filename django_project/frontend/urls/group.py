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

from frontend.views.admin.group.create import GroupCreateView
from frontend.views.admin.group.edit import GroupEditView
from frontend.views.admin.group.list import GroupListView

admin_detail_url = [
    url(
        r'^edit',
        GroupEditView.as_view(),
        name='admin-group-edit-view'
    ),
]
urlpatterns = [
    url(r'^(?P<pk>\d+)/', include(admin_detail_url)),
    url(
        r'^create',
        GroupCreateView.as_view(),
        name='admin-group-create-view'
    ),
    url(
        r'^',
        GroupListView.as_view(),
        name='admin-group-list-view'
    ),
]
