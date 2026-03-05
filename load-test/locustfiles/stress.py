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

from common import *  # noqa: F401,F403 — user classes + slow-request hook
from shapes import StressTestShape  # noqa: F401 — auto-discovered by Locust

"""Stress-test entry point — uses StressTestShape (ramp-up → hold → ramp-down).

Locust auto-discovers the single LoadTestShape subclass in this file and
applies it.  The shape's class attributes control the ramp configuration.

Default timeline
----------------
    Phase 1 — ramp-up  :   0 s → 120 s  (0 → 100 users)
    Phase 2 — hold     : 120 s → 420 s  (100 users sustained)
    Phase 3 — ramp-down: 420 s → 540 s  (100 → 0 users)

Usage
-----
    export GEOSIGHT_API_KEY=your_token_here
    export GEOSIGHT_USER_KEY=your_user_key_here       # optional
    export GEOSIGHT_CSRF_TOKEN=your_csrf_token_here   # optional
    export GEOSIGHT_REFERRER=https://geosight.unicef.org  # optional

    locust -f locustfiles/stress.py --host=https://geosight.unicef.org \\
        --headless --csv=results FullJourneyUser
"""
