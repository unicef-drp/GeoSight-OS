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
from rest_framework.routers import DefaultRouter

from geosight.data.api.v1.basemap import BasemapViewSet
from geosight.data.api.v1.data_browser import (
    DataBrowserApiList, DataBrowserApiListIds, DatasetApiList
)
from geosight.data.api.v1.indicator import IndicatorViewSet

router = DefaultRouter()
router.register(r'basemaps', BasemapViewSet, basename='basemaps')
router.register(r'indicators', IndicatorViewSet, basename='indicators')

data_browser_api_v1 = [
    url(r'^ids', DataBrowserApiListIds.as_view(), name='data-browser-ids-api'),
    url(r'^', DataBrowserApiList.as_view(), name='data-browser-api'),
]

urlpatterns = [
    url(r'^data-browser/', include(data_browser_api_v1)),
    url(r'^dataset', DatasetApiList.as_view(), name='dataset-api'),
]
urlpatterns += router.urls
