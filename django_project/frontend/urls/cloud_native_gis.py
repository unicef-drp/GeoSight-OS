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
__date__ = '12/07/2024'
__copyright__ = ('Copyright 2023, Unicef')

from django.conf.urls import url
from django.urls import include

from frontend.views.admin.cloud_native_gis.layer.edit import (
    CloudNativeGISLayerEditView
)
from frontend.views.admin.cloud_native_gis.layer.list import (
    CloudNativeGISLayerListView
)

layer_detail_url = [
    url(
        r'^edit',
        CloudNativeGISLayerEditView.as_view(),
        name='admin-cloud-native-gis-layer-edit-view'
    ),
]
layer_url = [
    url(r'^(?P<pk>\d+)/', include(layer_detail_url)),
    url(
        r'^',
        CloudNativeGISLayerListView.as_view(),
        name='admin-cloud-native-gis-layer-list-view'
    ),
]
urlpatterns = [
    url(r'^layer/', include(layer_url)),
]
