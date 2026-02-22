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
from shapes import StepLoadShape, StressTestShape, SpikeTestShape  # noqa: F401

"""Web UI entry point — exposes all user classes and all load shapes.

Use this file when running Locust with the interactive web interface so
that the ``--class-picker`` drop-downs show every available user class
and shape.

Usage
-----
    export GEOSIGHT_API_KEY=your_token_here

    locust -f locustfiles/ui.py --host=https://geosight.unicef.org \\
        --class-picker
"""
