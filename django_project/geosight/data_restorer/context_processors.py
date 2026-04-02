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

from geosight.data_restorer.models import Preferences


def data_restorer_context_processors(request):
    """Return if able to restore data."""
    preferences = Preferences.load()
    is_enable = preferences.is_enabled
    if not request.user.is_superuser:
        is_enable = False
    return {
        'data_restorer_enabled': is_enable
    }
