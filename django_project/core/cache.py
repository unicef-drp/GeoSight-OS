"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""
__author__ = 'irwan@kartoza.com'
__date__ = '07/11/2023'
__copyright__ = ('Copyright 2023, Unicef')

import logging

from django.core.cache import cache

logger = logging.getLogger(__name__)


class VersionCache:
    """Geosight cache system with version."""

    def __init__(self, key, version, request=None):
        """Initiate data."""
        if request and request.user.is_authenticated:
            key += f"-{request.user.id}"
        self.key = key
        self.version_key = f'{key}-version'
        self.version = version

    def get(self):
        """Return data from cache."""
        if cache.get(self.version_key) == self.version:
            return cache.get(self.key)
        return None

    def set(self, data: dict):
        """Set data to cache."""
        try:
            cache.set(self.key, data)
            cache.set(self.version_key, self.version)
        except Exception as e:
            logger.exception(e)
