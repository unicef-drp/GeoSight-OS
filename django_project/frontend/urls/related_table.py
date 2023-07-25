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

from frontend.views.admin.related_table.data import RelatedTableDataView
from frontend.views.admin.related_table.list import RelatedTableListView

data_url = [
    url(
        r'^data',
        RelatedTableDataView.as_view(),
        name='admin-related-table-data-view'
    ),
]
urlpatterns = [
    url(r'^(?P<pk>\d+)/', include(data_url)),
    url(
        r'^',
        RelatedTableListView.as_view(),
        name='admin-related-table-list-view'
    ),
]
