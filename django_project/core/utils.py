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

import uuid

from drf_yasg import openapi


def string_is_true(string: str):
    """Return is true or false of string contains true like string."""
    return str(string).lower() in ['y', 'yes', 't', 'true', 'ok', 'on', True]


def is_valid_uuid(value):
    """Check if sting is uuid."""
    try:
        uuid.UUID(str(value))
        return True
    except ValueError:
        return False


common_api_params = [
    openapi.Parameter(
        'page', openapi.IN_QUERY,
        description='Page number in pagination',
        type=openapi.TYPE_INTEGER,
        default=1
    ), openapi.Parameter(
        'page_size', openapi.IN_QUERY,
        description='Total records in a page',
        type=openapi.TYPE_INTEGER,
        default=50
    )
]


class ApiTag:
    """Return API Tags."""

    DATASET = 'Dataset'
