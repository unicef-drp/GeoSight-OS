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

from urllib.parse import urlparse, parse_qsl, urlencode, urlunparse


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


def set_query_parameter(url, params):
    """Given a URL and replace a query parameter and return modified URL."""
    url_parse = urlparse(url)
    query = url_parse.query
    url_dict = dict(parse_qsl(query))
    url_dict.update(params)
    url_new_query = urlencode(url_dict)
    url_parse = url_parse._replace(query=url_new_query)
    return urlunparse(url_parse)
