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
__date__ = '13/06/2023'
__copyright__ = ('Copyright 2023, Unicef')

from celery.utils.log import get_task_logger

from core.celery import app
from geosight.georepo.models.reference_layer import ReferenceLayerView

logger = get_task_logger(__name__)


@app.task
def fetch_reference_codes(_id):
    """Fetch reference codes."""
    try:
        reference_layer_view = ReferenceLayerView.objects.get(id=_id)
        reference_layer_view.sync_entities_code()
    except ReferenceLayerView.DoesNotExist:
        logger.error(f'Reference Layer View {_id} does not exist')
