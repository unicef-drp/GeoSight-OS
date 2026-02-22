# coding=utf-8
"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""
__author__ = 'danang@kartoza.com'
__date__ = '21/02/2026'
__copyright__ = ('Copyright 2026, Unicef')

import sys
from pathlib import Path

"""Shared setup imported by every GeoSight locustfile.

Responsibilities
----------------
* Adds the ``load-test/`` root to ``sys.path`` so that the ``users`` and
  ``shapes`` packages are importable regardless of which subdirectory the
  locustfile lives in.
* Re-exports all active user classes so scenario files can write::

      from common import *   # user classes + hook in one line

* Registers the slow-request warning hook exactly once per process.
"""


# ---------------------------------------------------------------------------
# sys.path fix — must happen before any load-test imports
# ---------------------------------------------------------------------------

_ROOT = str(Path(__file__).parent.parent)
if _ROOT not in sys.path:
    sys.path.insert(0, _ROOT)

# ---------------------------------------------------------------------------
# User class imports
# ---------------------------------------------------------------------------

import locust.stats  # noqa: E402
from locust import events  # noqa: E402 (import after sys.path fix)
from users import (  # noqa: E402
    FullJourneyUser,
    DashboardDataUser,
    DashboardBookmarksUser,
    IndicatorMetadataUser,
    RelatedTableDatesUser,
    IndicatorDataUser,
    IndicatorsBulkDataUser,
    IndicatorStatisticUser,
    IndicatorValuesUser,
    IndicatorLayerUser,
    ReferenceDatasetsUser,
    # Temporarily excluded — do not support Token Auth yet:
    # RelatedTableDetailUser,
    # RelatedTableDataUser,
)

__all__ = [
    "FullJourneyUser",
    "DashboardDataUser",
    "DashboardBookmarksUser",
    "IndicatorMetadataUser",
    "RelatedTableDatesUser",
    "IndicatorDataUser",
    "IndicatorsBulkDataUser",
    "IndicatorStatisticUser",
    "IndicatorValuesUser",
    "IndicatorLayerUser",
    "ReferenceDatasetsUser",
]


# Reduce console log spam by printing stats every 30 seconds.
locust.stats.CONSOLE_STATS_INTERVAL_SEC = 30

# ---------------------------------------------------------------------------
# Slow-request hook — registered once when this module is imported
# ---------------------------------------------------------------------------


@events.request.add_listener
def on_request(
    request_type, name, response_time, response_length, exception, **kwargs
):
    """Warn about requests that take longer than 3 seconds.

    :param request_type: The type of HTTP request (GET, POST, etc.)
    :type request_type: str
    :param name: The name or URL of the request
    :type name: str
    :param response_time: The response time in milliseconds
    :type response_time: float
    :param response_length: The length of the response in bytes
    :type response_length: int
    :param exception: Any exception that occurred during the request
    :type exception: Exception or None
    :param **kwargs: Additional keyword arguments
    :type **kwargs: dict
    """
    if response_time > 3000:
        print(
            f"[SLOW] {request_type} {name} — {response_time:.0f} ms "
            f"| {response_length} bytes"
        )
