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
__date__ = '02/01/2024'
__copyright__ = ('Copyright 2023, Unicef')

import os

FOLDER = os.path.dirname(os.path.abspath(__file__))


def load_file(self, relative_url):
    """Mock for load excel."""
    try:
        _filename = os.path.join(FOLDER, '_fixtures', relative_url)
        open(_filename)
        return _filename
    except IOError as e:
        raise Exception('File does not exist')
