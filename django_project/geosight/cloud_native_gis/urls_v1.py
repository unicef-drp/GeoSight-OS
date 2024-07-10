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
__date__ = '06/06/2023'
__copyright__ = ('Copyright 2023, Unicef')

from cloud_native_gis.api.layer import LayerStyleViewSet
from rest_framework.routers import DefaultRouter
from rest_framework_nested.routers import NestedSimpleRouter

from geosight.cloud_native_gis.api.v1.cloud_native_gis import (
    CloudNativeGISLayerViewSet
)

router = DefaultRouter()
router.register(
    r'cloud-native-gis-layer', CloudNativeGISLayerViewSet,
    basename='cloud-native-gis-layer-view-set'
)
layer_router = NestedSimpleRouter(
    router, r'cloud-native-gis-layer', lookup='layer'
)
layer_router.register(
    'style', LayerStyleViewSet,
    basename='cloud-native-gis-style-view-set'
)

urlpatterns = router.urls
urlpatterns += layer_router.urls
