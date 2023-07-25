# coding=utf-8
"""
GeoSight is UNICEF’s geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""
__author__ = 'danang@kartoza.com'
__date__ = '26/06/2023'
__copyright__ = ('Copyright 2023, Unicef')

import json
import logging

logger = logging.getLogger(__name__)


def logger_debug(
        msg="",
        dct={},
        log=logger,
        sensitive_fields=[
            "access_token",
            "assertion",
            "client_secret",
            "id_token",
            "password",
            "refresh_token",
        ],
        *args,
        **kwargs
):
    """Debug log and masked confidential information."""
    output = {}

    def wipe(dictionary, sensitive_fields=[]):
        """Masks sensitive info."""
        for sensitive in sensitive_fields:
            if (
                    sensitive in dictionary.keys() or
                    sensitive.upper() in dictionary.keys()
            ):
                dictionary[sensitive] = "********"

    try:
        output = dct.copy()
        wipe(output, sensitive_fields)
        msg += " %s"
        output = json.dumps(output, indent=4, sort_keys=True)
        log.debug(msg, output)
    except Exception as e:
        logger.exception(e)
