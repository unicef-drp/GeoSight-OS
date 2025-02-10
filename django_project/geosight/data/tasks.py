# coding=utf-8
"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""
__author__ = 'zakki@kartoza.com'
__date__ = '16/02/2025'
__copyright__ = ('Copyright 2025, Unicef')

from celery.utils.log import get_task_logger

from core.celery import app
from geosight.data.models.style.raster import COGClassification

logger = get_task_logger(__name__)


@app.task
def recalculate_cog_classification(_id):
    """Recalculate COG Classification."""
    try:
        classification = COGClassification.objects.get(id=_id)
    except COGClassification.DoesNotExist:
        return False

    # set result as empty, then save to auto recalculate
    classification.result = []
    classification.save()
