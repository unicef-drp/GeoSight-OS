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

"""Headless entry point — no load shape, driven entirely by -u/-r/--run-time.

Use this file for flat-load scenarios such as the Baseline test where you
want a fixed user count for a fixed duration.  Importing no LoadTestShape
subclass means Locust will not override the CLI options.

Usage
-----
    export GEOSIGHT_API_KEY=your_token_here
    export GEOSIGHT_USER_KEY=your_user_key_here       # optional
    export GEOSIGHT_CSRF_TOKEN=your_csrf_token_here   # optional
    export GEOSIGHT_REFERRER=https://geosight.unicef.org  # optional

    # Baseline: 1 user, 2-minute run, single endpoint
    locust -f locustfiles/headless.py --host=https://geosight.unicef.org \\
        --headless -u 1 -r 1 --run-time 2m --csv=results \\
        IndicatorValuesUser

    # Full journey: 10 users, 5-minute run
    locust -f locustfiles/headless.py --host=https://geosight.unicef.org \\
        --headless -u 10 -r 2 --run-time 5m --csv=results \\
        FullJourneyUser
"""
