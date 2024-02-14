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
from rest_framework_nested.routers import NestedSimpleRouter

from geosight.data.api.v1.basemap import BasemapViewSet
from geosight.data.api.v1.data_browser import (
    DataBrowserApiList, DataBrowserApiListIds,
    DatasetApiList, DatasetApiListIds
)
from geosight.data.api.v1.indicator import IndicatorViewSet
from geosight.data.api.v1.related_table import RelatedTableViewSet
from geosight.data.api.v1.related_table_data import RelatedTableDataViewSet

router = DefaultRouter()
router.register(r'basemaps', BasemapViewSet, basename='basemaps')
router.register(r'indicators', IndicatorViewSet, basename='indicators')

router.register(
    r'related_tables', RelatedTableViewSet, basename='related_tables')
related_tables_router = NestedSimpleRouter(
    router, r'related_tables', lookup='related_tables')
related_tables_router.register(
    'data', RelatedTableDataViewSet, basename='related_tables_data'
)

data_browser_api_v1 = [
    url(r'^ids', DataBrowserApiListIds.as_view(), name='data-browser-ids-api'),
    url(r'^', DataBrowserApiList.as_view(), name='data-browser-api'),
]

urlpatterns = [
    url(r'^data-browser/', include(data_browser_api_v1)),
    url(r'^dataset/ids', DatasetApiListIds.as_view(), name='dataset-ids-api'),
    url(r'^dataset', DatasetApiList.as_view(), name='dataset-api'),
]
urlpatterns += router.urls
urlpatterns += related_tables_router.urls
