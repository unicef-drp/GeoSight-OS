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
from django.conf.urls import url, include

from geosight.georepo.api import (
    ReferenceLayerEntityDrilldownAPI, ReferenceLayerVectorTile,
    ReferenceLayerCentroidUrls, ReferenceLayerCentroid
)
from geosight.georepo.api.mock.api import MockGeorepoAPI

boundary_api = [
    url(
        r'^centroid/(?P<level>\d+)$',
        ReferenceLayerCentroid.as_view(),
        name='boundary-centroid-api'
    ),
    url(
        r'^centroid$',
        ReferenceLayerCentroidUrls.as_view(),
        name='boundary-centroid-url-api'
    ),
    url(
        r'^vector-tiles/(?P<z>\d+)/(?P<x>\d+)/(?P<y>\d+)/$',
        ReferenceLayerVectorTile.as_view(),
        name='boundary-vector-tile-api'
    ),
]
urlpatterns = [
    url(
        r'^entity/(?P<concept_uuid>[^/]+)/drilldown',
        ReferenceLayerEntityDrilldownAPI.as_view(),
        name='entity-drilldown-api'
    ),
    url(r'^boundary/(?P<identifier>[^/]+)/', include(boundary_api)),
]

if settings.MOCK_GEOREPO:
    urlpatterns += [
        url(
            r'^mock',
            MockGeorepoAPI.as_view(),
            name='mock-georepo-api'
        ),
    ]
