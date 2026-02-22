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
from shapes import SpikeTestShape  # noqa: F401 — auto-discovered by Locust

"""Spike-test entry point — uses SpikeTestShape (baseline → spike → recovery).

Locust auto-discovers the single LoadTestShape subclass in this file and
applies it.  The shape's class attributes control the spike configuration.

Default timeline
----------------
    Phase 1 — baseline :   0 s →  60 s  (10 users)
    Phase 2 — spike-up :  60 s →  70 s  (10 → 150 users in 10 s)
    Phase 3 — spike hold: 70 s → 130 s  (150 users for 60 s)
    Phase 4 — recovery : 130 s → 140 s  (150 → 10 users in 10 s)
    Phase 5 — baseline : 140 s → 200 s  (10 users, post-spike)

Usage
-----
    export GEOSIGHT_API_KEY=your_token_here

    locust -f locustfiles/spike.py --host=https://geosight.unicef.org \\
        --headless --csv=results FullJourneyUser
"""
