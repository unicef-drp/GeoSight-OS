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
__date__ = '06/11/2023'
__copyright__ = ('Copyright 2023, Unicef')

import os


def load_sql(folder, filename):
    """Load sql."""
    file_path = os.path.join(
        os.path.dirname(os.path.abspath(__file__)),
        folder, filename
    )
    return open(file_path).read()
