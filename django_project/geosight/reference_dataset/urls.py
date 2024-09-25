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

from django.conf.urls import url, include
from rest_framework.routers import DefaultRouter

from geosight.reference_dataset.api.reference_dataset import (
    ReferenceDatasetVectorTile,
    ReferenceDatasetCentroidUrls, ReferenceDatasetCentroid
)
from geosight.reference_dataset.api.reference_dataset_importer import (
    ReferenceDatasetImporterFileView, ReferenceDatasetRearrangeView,
    ReferenceDatasetImporterView, ReferenceDatasetImporterFileUpdateView
)

router = DefaultRouter()
router.register(
    r'reference-datasets-importer', ReferenceDatasetImporterView,
    basename='reference-datasets-importer-api'
)

reference_dataset_api = [
    url(
        r'^upload-file$',
        ReferenceDatasetImporterFileView.as_view(),
        name='reference-datasets-upload-file-api'
    ),
    url(
        r'^rearrange$',
        ReferenceDatasetRearrangeView.as_view(),
        name='reference-datasets-rearrange-api'
    ),
    url(
        r'^update-level-value$',
        ReferenceDatasetImporterFileUpdateView.as_view(),
        name='reference-datasets-update-level-value-api'
    ),
    # Other API
    url(
        r'^centroid/(?P<level>\d+)$',
        ReferenceDatasetCentroid.as_view(),
        name='reference-datasets-centroid-api'
    ),
    url(
        r'^centroid$',
        ReferenceDatasetCentroidUrls.as_view(),
        name='reference-datasets-centroid-url-api'
    ),
    url(
        r'^vector-tiles/(?P<z>\d+)/(?P<x>\d+)/(?P<y>\d+)/$',
        ReferenceDatasetVectorTile.as_view(),
        name='reference-datasets-vector-tile-api'
    ),
]
urlpatterns = [
    url(
        r'^reference-datasets/(?P<identifier>[^/]+)/',
        include(reference_dataset_api)
    ),
]
urlpatterns += router.urls
