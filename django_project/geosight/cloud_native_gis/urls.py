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
__date__ = '06/06/2024'
__copyright__ = ('Copyright 2023, Unicef')

from django.conf.urls import url
from django.urls import include
from django.views.generic import TemplateView

from geosight.cloud_native_gis.api.cloud_native_gis import (
    CloudNativeGISLayerVectorTile, CloudNativeGISLayerImporterFileView,
    CloudNativeGISLayerLastImporter
)

# ------------------------------------------------------
# CONTEXT LAYER MANAGEMENT
cloud_native_gis_layer = [
    url(
        r'^(?P<pk>[^/]+)/last-importer/$',
        CloudNativeGISLayerLastImporter.as_view(),
        name='cloud-native-gis-last-importer'
    ),
    url(
        r'^(?P<pk>[^/]+)/upload/$',
        CloudNativeGISLayerImporterFileView.as_view(),
        name='cloud-native-gis-upload'
    ),
    url(
        r'^(?P<identifier>[^/]+)/tiles/(?P<z>\d+)/(?P<x>\d+)/(?P<y>\d+)/$',
        CloudNativeGISLayerVectorTile.as_view(),
        name='cloud-native-gis-vector-tile'
    ),
]

api = [
    url(r'^cloud-native-gis/', include(cloud_native_gis_layer)),
]
urlpatterns = [
    url(r'^api/', include(api)),
    url(
        '^maputnik/',
        TemplateView.as_view(template_name='cloud_native_gis/maputnik.html'),
        name='cloud-native-gis-maputnik'
    )
]
