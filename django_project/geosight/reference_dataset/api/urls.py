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
__date__ = '12/02/2024'
__copyright__ = ('Copyright 2023, Unicef')

from rest_framework.routers import DefaultRouter

from .v1.entities import EntityViewSet
from .v1.reference_dataset import ReferenceDatasetViewSet

detail_api = []

router = DefaultRouter()
router.register(
    r'reference-datasets/(?P<identifier>[^/]+)/entity',
    EntityViewSet, basename='reference-datasets-entity-api'
)
router.register(
    r'reference-datasets', ReferenceDatasetViewSet,
    basename='reference-datasets-api'
)

urlpatterns = router.urls
