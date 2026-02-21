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

from locust import events

# Load shapes — import so Locust can discover them via --shape flag.
from shapes import StepLoadShape, StressTestShape, SpikeTestShape  # noqa: F401

# Re-export all user classes so Locust discovers them automatically.
from users import (
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
    RelatedTableDetailUser,
    RelatedTableDataUser,
)

__all__ = [
    # User classes
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
    "RelatedTableDetailUser",
    "RelatedTableDataUser",
    # Load shapes
    "StepLoadShape",
    "StressTestShape",
    "SpikeTestShape",
]


"""
GeoSight load test entry point.

Scenarios
---------
Full journey (sequential waterfall)
    FullJourneyUser         — opens a dashboard and explores data end-to-end

Single-endpoint (isolate one API call at a time)
    DashboardDataUser       — GET /api/dashboard/[slug]/data
    DashboardBookmarksUser  — GET /api/dashboard/[slug]/bookmarks
    IndicatorMetadataUser   — POST /api/indicator/metadata
    RelatedTableDatesUser   — GET /api/v1/related-tables/[id]/geo-data/dates/
    IndicatorDataUser       — GET /api/v1/indicators/[id]/data/
    IndicatorsBulkDataUser  — GET /api/v1/indicators/data/
    IndicatorStatisticUser  — GET /api/v1/indicators/[id]/data/statistic/
    IndicatorValuesUser     — GET /api/v1/indicators/[id]/data/values/
    IndicatorLayerUser      — GET /api/dashboard/[slug]/indicator-layer/[id]
    ReferenceDatasetsUser   — GET /api/v1/reference-datasets/[uuid]/
    RelatedTableDetailUser  — GET /api/related-table/[id]/
    RelatedTableDataUser    — GET /api/related-table/[id]/data

Parameters are loaded from ``data/params.json`` (override with PARAMS_PATH).

Usage
-----
    export GEOSIGHT_API_KEY=your_token_here

    # Interactive UI — pick a scenario via the class-picker
    locust -f locustfile.py --host=https://geosight.unicef.org --class-picker

    # Headless — full journey
    locust -f locustfile.py --host=https://geosight.unicef.org \\
        --headless -u 10 -r 2 --run-time 5m --csv=results \\
        FullJourneyUser

    # Headless — single endpoint
    locust -f locustfile.py --host=https://geosight.unicef.org \\
        --headless -u 20 -r 2 --run-time 2m --csv=results \\
        IndicatorValuesUser

    # Step load (ramp-up) — increases users in discrete steps
    locust -f locustfile.py --host=https://geosight.unicef.org \\
        --headless --shape StepLoadShape --csv=results \\
        FullJourneyUser

    # Stress test — ramp up, sustain peak, ramp down
    locust -f locustfile.py --host=https://geosight.unicef.org \\
        --headless --shape StressTestShape --csv=results \\
        FullJourneyUser

    # Spike test — baseline → sudden spike → recovery → baseline
    locust -f locustfile.py --host=https://geosight.unicef.org \\
        --headless --shape SpikeTestShape --csv=results \\
        FullJourneyUser
"""


# ---------------------------------------------------------------------------
# Slow-request hook
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
