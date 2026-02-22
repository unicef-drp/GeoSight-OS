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
from shapes import StepLoadShape  # noqa: F401 — auto-discovered by Locust

"""Step-load entry point — uses StepLoadShape to ramp users in discrete steps.

Locust auto-discovers the single LoadTestShape subclass in this file and
applies it.  The shape's class attributes control the step configuration.

Default timeline
----------------
    0 s  →  60 s  : 10 users  (step 1)
    60 s → 120 s  : 20 users  (step 2)
    ...until step_count (5) steps have elapsed, then the test ends.

Usage
-----
    export GEOSIGHT_API_KEY=your_token_here

    locust -f locustfiles/step.py --host=https://geosight.unicef.org \\
        --headless --csv=results FullJourneyUser
"""
