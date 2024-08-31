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
__date__ = '08/06/2024'
__copyright__ = ('Copyright 2023, Unicef')

from rest_framework.routers import DefaultRouter

from geosight.tenants.api.content_limitation import (
    ContentLimitationAPI, ContentLimitationTenantAPI
)
from geosight.tenants.api.tenant import TenantAPI

router = DefaultRouter()
router.register(
    r'content-limitation', ContentLimitationAPI,
    basename='content-limitation'
)
router.register(
    r'content-limitation-tenants', ContentLimitationTenantAPI,
    basename='content-limitations'
)
router.register(r'', TenantAPI, basename='tenants')

urlpatterns = []
urlpatterns += router.urls
