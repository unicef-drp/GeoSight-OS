# coding=utf-8
"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-No-reply@unicef.org

.. Note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""
__author__ = 'irwan@kartoza.com'
__date__ = '02/04/2026'
__copyright__ = ('Copyright 2023, Unicef')

from django.contrib import admin

from geosight.data_restorer.models import Preferences, RequestRestoreData


@admin.register(Preferences)
class PreferencesAdmin(admin.ModelAdmin):
    """Preferences admin."""

    pass


@admin.register(RequestRestoreData)
class RequestRestoreDataAdmin(admin.ModelAdmin):
    """RequestRestoreData admin."""

    list_display = ('data_type', 'state', 'note')
    list_filter = ('state', 'data_type')
    readonly_fields = ('state', 'note')
