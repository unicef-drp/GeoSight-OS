# coding=utf-8
"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""

import hashlib


def generate_cache_key(url, payload):
    """
    Generate a unique cache key based on the URL and payload.
    """
    payload_hash = hashlib.sha256(str(payload).encode('utf-8')).hexdigest()
    return f"cache:{url}:{payload_hash}"

