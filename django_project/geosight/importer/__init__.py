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
__date__ = '13/06/2023'
__copyright__ = ('Copyright 2023, Unicef')

from django.apps import AppConfig


class Config(AppConfig):
    """GeoSight Config App."""

    label = 'geosight_importer'
    name = 'geosight.importer'
    verbose_name = "GeoSight Data Management"


default_app_config = 'geosight.importer.Config'
