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

from geosight.georepo.api import ReferenceLayerEntityDrilldownAPI
from geosight.georepo.api.mock.api import MockGeorepoAPI

urlpatterns = [
    url(
        r'^entity/(?P<concept_uuid>[^/]+)/drilldown',
        ReferenceLayerEntityDrilldownAPI.as_view(),
        name='entity-drilldown-api'
    )
]

if settings.MOCK_GEOREPO:
    urlpatterns += [
        url(
            r'^mock',
            MockGeorepoAPI.as_view(),
            name='mock-georepo-api'
        ),
    ]
