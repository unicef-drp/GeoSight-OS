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

from frontend.views.admin.indicator.create import IndicatorCreateView
from frontend.views.admin.indicator.edit import (
    IndicatorEditView, IndicatorEditBatchView
)
from frontend.views.admin.indicator.list import IndicatorListView
from frontend.views.admin.indicator.value_management import (
    IndicatorValueManagementMapView, IndicatorValueManagementTableView
)
from frontend.views.admin.indicator.values import IndicatorValueListView

admin_indicator_detail_url = [
    url(
        r'^edit',
        IndicatorEditView.as_view(),
        name='admin-indicator-edit-view'
    ),
    url(
        r'^value-list$',
        IndicatorValueListView.as_view(),
        name='admin-indicator-value-list-manager'
    ),
    url(
        r'^value-manager-map$',
        IndicatorValueManagementMapView.as_view(),
        name='admin-indicator-value-mapview-manager'
    ),
    url(
        r'^value-manager-form',
        IndicatorValueManagementTableView.as_view(),
        name='admin-indicator-value-form-manager'
    ),
]
urlpatterns = [
    url(r'^(?P<pk>\d+)/', include(admin_indicator_detail_url)),
    url(
        r'^edit/batch',
        IndicatorEditBatchView.as_view(),
        name='admin-indicator-edit-batch-view'
    ),
    url(
        r'^create',
        IndicatorCreateView.as_view(),
        name='admin-indicator-create-view'
    ),
    url(
        r'^',
        IndicatorListView.as_view(),
        name='admin-indicator-list-view'
    ),
]
