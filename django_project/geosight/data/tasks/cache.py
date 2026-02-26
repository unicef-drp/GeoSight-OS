# coding=utf-8
"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""
__author__ = 'irwan@kartoza.com'
__date__ = '26/02/2026'
__copyright__ = ('Copyright 2026, Unicef')

from celery.utils.log import get_task_logger

from core.celery import app

logger = get_task_logger(__name__)


@app.task
def dashboard_cache_generation(dashboard_id):
    """Doing cache for dashboard."""

    # TODO:
    #  Put other dashboard cache generation here
    pass
