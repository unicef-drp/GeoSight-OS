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
__date__ = '13/06/2023'
__copyright__ = ('Copyright 2023, Unicef')

"""All importer execptions."""


class ImporterError(Exception):
    """Error class for Importer."""

    def __init__(self, message):
        """init."""
        self.message = message
        super().__init__(self.message)


class ImporterDoesNotExist(Exception):
    """Error when importer does not exist."""

    def __init__(self):
        """init."""
        super().__init__('Importer does not exist.')
