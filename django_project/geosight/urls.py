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

from django.conf import settings
from django.conf.urls import url
from django.urls import include

urlpatterns = [
    url(r'^importer/', include('geosight.importer.urls')),
    url(r'^georepo/', include('geosight.georepo.urls')),
    url(r'^reference-dataset/', include('geosight.reference_dataset.urls')),
    url(r'^', include('geosight.data.urls')),
]
if settings.CLOUD_NATIVE_GIS_ENABLED:
    urlpatterns += [
        url(r'^cloud-native-gis/', include('cloud_native_gis.urls')),
        url(r'^cloud-native-gis/', include('geosight.cloud_native_gis.urls')),
    ]
