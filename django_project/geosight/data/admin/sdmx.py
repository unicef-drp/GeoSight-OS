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
__date__ = '10/11/2025'
__copyright__ = ('Copyright 2025, Unicef')

from django.contrib import admin

from geosight.data.models.sdmx import SDMXConfig


@admin.register(SDMXConfig)
class SDMXConfigAdmin(admin.ModelAdmin):
    """SDMX Config admin."""

    list_display = ('name', 'url')
