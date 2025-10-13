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
from rest_framework.routers import DefaultRouter
from rest_framework_nested.routers import NestedSimpleRouter

from geosight.data.api.v1.basemap import BasemapViewSet
from geosight.data.api.v1.codelist import CodeListViewSet
from geosight.data.api.v1.context_layer import ContextLayerViewSet
from geosight.data.api.v1.context_layer.detail import (
    ContextLayerDataViewSet, ContextLayerAttributesViewSet
)
from geosight.data.api.v1.dashboard import DashboardViewSet
from geosight.data.api.v1.data_browser import (
    DataBrowserApiList, DatasetApiList
)
from geosight.data.api.v1.group import GroupViewSet
from geosight.data.api.v1.indicator import (
    IndicatorViewSet, IndicatorDataViewSet,
)
from geosight.data.api.v1.indicator.indicators_data import (
    IndicatorsDataViewSet
)
from geosight.data.api.v1.related_table import (
    RelatedTableViewSet, RelatedTableDataViewSet, RelatedTableGeoDataViewSet
)
from geosight.data.api.v1.style import StyleViewSet
from geosight.data.api.v1.users import UserViewSet

router = DefaultRouter()
router.register(r'basemaps', BasemapViewSet, basename='basemaps')
router.register(r'dashboards', DashboardViewSet, basename='dashboards')
router.register(r'styles', StyleViewSet, basename='styles')
router.register(r'users', UserViewSet, basename='users')
router.register(r'groups', GroupViewSet, basename='groups')
router.register(r'code-list', CodeListViewSet, basename='codelist')
router.register(r'dataset', DatasetApiList, basename='dataset')
router.register(r'data-browser', DataBrowserApiList, basename='data-browser')

# Context layers
router.register(
    r'context-layers', ContextLayerViewSet, basename='context-layers'
)
context_layers_router = NestedSimpleRouter(
    router, r'context-layers', lookup='context_layer')
context_layers_router.register(
    'data', ContextLayerDataViewSet, basename='context_layers_data'
)
context_layers_router.register(
    'attributes', ContextLayerAttributesViewSet,
    basename='context_layers_attributes'
)

# Indicator
router.register(
    r'indicators/data', IndicatorsDataViewSet, basename='indicators_data'
)
router.register(r'indicators', IndicatorViewSet, basename='indicators')
indicators_router = NestedSimpleRouter(
    router, r'indicators', lookup='indicators')
indicators_router.register(
    'data', IndicatorDataViewSet, basename='indicator_data'
)

# Related table API
router.register(
    r'related-tables', RelatedTableViewSet, basename='related_tables'
)
related_tables_router = NestedSimpleRouter(
    router, r'related-tables', lookup='related_tables'
)
related_tables_router.register(
    'data', RelatedTableDataViewSet, basename='related_tables_data'
)
related_tables_router.register(
    'geo-data', RelatedTableGeoDataViewSet,
    basename='related_tables_geo_data'
)
urlpatterns = router.urls
urlpatterns += related_tables_router.urls
urlpatterns += indicators_router.urls
urlpatterns += context_layers_router.urls

if settings.REFERENCE_DATASET_ENABLED:
    urlpatterns += [
        url(r'^', include('geosight.reference_dataset.api.urls')),
    ]
