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
__date__ = '02/04/2026'
__copyright__ = ('Copyright 2023, Unicef')

from django.urls import path

from geosight.data_restorer.api import (
    FixtureTypesAPI, PreferencesAPI,
    RequestRestoreDataAPI, RequestRestoreDataDetailAPI,
)

urlpatterns = [
    path(
        'data-restorer/fixture-types/',
        FixtureTypesAPI.as_view(),
        name='data-restorer-fixture-types'
    ),
    path(
        'data-restorer/request/status/',
        RequestRestoreDataDetailAPI.as_view(),
        name='data-restorer-request-status'
    ),
    path(
        'data-restorer/request/',
        RequestRestoreDataAPI.as_view(),
        name='data-restorer-request'
    ),
    path(
        'data-restorer/preferences/disable/',
        PreferencesAPI.as_view(),
        name='data-restorer-preferences-disable'
    ),
]