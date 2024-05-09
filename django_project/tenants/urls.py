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

from django.conf.urls import url

from tenants.api import SchemaNameByDomain

urlpatterns = [
    url(
        r'^schema-name-by-domain',
        SchemaNameByDomain.as_view(), name='schema-by-domain'
    ),
]
