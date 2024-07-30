# coding=utf-8
from __future__ import absolute_import, unicode_literals

"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""
__author__ = 'irwan@kartoza.com'
__date__ = '06/06/2024'
__copyright__ = ('Copyright 2023, Unicef')

from django.apps import AppConfig


class Config(AppConfig):
    """GeoSight Config App."""

    label = 'geosight_cloud_native_gis'
    name = 'geosight.cloud_native_gis'
    verbose_name = "GeoSight Cloud Native GIS"


default_app_config = 'geosight.cloud_native_gis.Config'
