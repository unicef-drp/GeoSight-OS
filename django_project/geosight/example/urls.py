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
__date__ = '01/05/2026'
__copyright__ = ('Copyright 2026, Unicef')

from django.conf.urls import url, include

from geosight.example.views.sdmx import (
    SDMXAgenciesView, SDMXDataflowView, SDMXDataflowVersionView,
    SDMXDataStructureView, SDMXDataView
)

app_name = 'geosight-example'

sdmx = [
    url(
        r'^agencyscheme/all/all/all',
        SDMXAgenciesView.as_view(),
        name='example-agencies'
    ),
    url(
        r'^dataflow/(?P<agency_id>[^/]+)/(?P<dataflow_id>[^/]+)/all',
        SDMXDataflowVersionView.as_view(),
        name='example-dataflow-version'
    ),
    url(
        r'^dataflow/',
        SDMXDataflowView.as_view(),
        name='example-dataflow'
    ),
    url(
        r'^datastructure/(?P<agency_id>[^/]+)/'
        r'(?P<dsd_id>[^/]+)/(?P<version>[^/]+)',
        SDMXDataStructureView.as_view(),
        name='example-datastructure'
    ),
    url(
        r'^data/(?P<agency_id>[^,]+),(?P<dataflow_id>[^,]+),'
        r'(?P<version>[^/?]+)(?:/(?P<key>[^?/]*))?',
        SDMXDataView.as_view(),
        name='example-data'
    ),
]
urlpatterns = [
    url(r'^sdmx/', include(sdmx)),
]
