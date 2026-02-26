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
    """Generate a unique cache key based on a URL and payload.

    Produces a deterministic cache key by hashing the payload with SHA-256
    and combining it with the URL.

    :param url: The request URL used as part of the cache key.
    :type url: str
    :param payload: The request payload to hash into the key.
    :type payload: any
    :return: A cache key string in the format ``cache:<url>:<hash>``.
    :rtype: str
    """
    payload_hash = hashlib.sha256(str(payload).encode('utf-8')).hexdigest()
    return f"cache:{url}:{payload_hash}"
