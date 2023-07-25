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


class TokenError(Exception):
    """
    Token Error Sample.

    ```json
    {
        "error": "invalid_grant",
        "error_description": "AADSTS501481: The Code_Verifier does not match
          the code_challenge supplied in the authorization request.
        Trace ID: 29492451-a7cf-4650-b530-e947042b5700
        Correlation ID: 50087be9-d2db-4e08-abd6-2746fe9af2d1
        Timestamp: 2022-07-18 15:50:01Z",
        "error_codes": [
            501481
        ],
        "timestamp": "2022-07-18 15:50:01Z",
        "trace_id": "29492451-a7cf-4650-b530-e947042b5700",
        "correlation_id": "50087be9-d2db-4e08-abd6-2746fe9af2d1"
    }
    ```
    """

    def __init__(self, token={}):
        """Initialize TokenError exception."""
        self.token = token

    def __str__(self):
        """Return string representation."""
        if not self.token:
            return
        if isinstance(self.token, dict):
            return json.dumps(
                self.token,
                indent=4,
                skipkeys=["CLIENT_SECRET", ],
            )
        return str(self.token)


class InvalidAuthenticationToken(TokenError):
    """
    Invalid Authentication Token Sample.

    ```json
    {
        "error": {
            "code": "InvalidAuthenticationToken",
            "innerError": {
                "client-request-id": "6609865e-44c4-40cc-a55b-ab78cbfce628",
                "date": "2022-07-17T15:54:29",
                "request-id": "6609865e-44c4-40cc-a55b-ab78cbfce628"
            },
            "message": "CompactToken parsing failed with error code: 80049217"
        }
    }
    ```
    """

    pass


class RenameAttributesValueError(ValueError):
    """Rename Attributes error."""

    pass


class InvalidUserError(Exception):
    """Exception that is thrown when non-Unicef user has signed in."""

    pass
