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

from geosight.cloud_native_gis.api.cloud_native_gis import (
    CloudNativeGISLayerUploadCreate, CloudNativeGISDownloadFileAPI
)

urlpatterns = [
    url(
        r'^upload-create$',
        CloudNativeGISLayerUploadCreate.as_view(),
        name='cloud-native-gis-upload-create'
    ),
    url(
        r'^download/(?P<unique_id>[^/]+)$',
        CloudNativeGISDownloadFileAPI.as_view(),
        name='cloud-native-gis-download-file-data'
    )
]
