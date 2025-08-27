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
    """
    Geosight cache system with version control.

    This class provides a caching mechanism that associates a cache entry with
    a version key.
    If the version key in the cache matches the expected version,
    the cached data is returned; otherwise, the cache is considered invalid.
    """

    def __init__(self, key: str, version: str, request=None):  # noqa DOC101
        if request and request.user.is_authenticated:
            key += f"-{request.user.id}"
        self.key = key
        self.version_key = f'{key}-version'
        self.version = version

    def get(self):
        """
        Retrieve data from cache if the version matches.

        :return: Cached data if the version matches, otherwise ``None``.
        :rtype: dict or None
        """
        if cache.get(self.version_key) == self.version:
            return cache.get(self.key)
        return None

    def set(self, data: dict):
        """
        Store data in the cache along with its version.

        :param data: Data to be cached.
        :type data: dict
        """
        try:
            cache.set(self.key, data)
            cache.set(self.version_key, self.version)
        except Exception as e:
            logger.exception(e)
