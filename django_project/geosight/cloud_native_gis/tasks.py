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
__date__ = '30/07/2024'
__copyright__ = ('Copyright 2023, Unicef')

from celery.utils.log import get_task_logger
from cloud_native_gis.models.layer import Layer

from core.celery import app
from geosight.data.models.context_layer import ContextLayer

logger = get_task_logger(__name__)


@app.task
def clean_cloud_native_layer():
    """Clean cloud native layers that does not have context layer."""
    Layer.objects.exclude(
        pk__in=ContextLayer.objects.all().values_list(
            'cloud_native_gis_layer__pk', flat=True
        )
    ).delete()
