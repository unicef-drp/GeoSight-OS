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
__date__ = '25/09/2023'
__copyright__ = ('Copyright 2023, Unicef')

from celery.utils.log import get_task_logger

from core.celery import app
from geosight.reference_dataset.models.reference_dataset_importer import (
    ReferenceDatasetImporter
)

logger = get_task_logger(__name__)


@app.task
def run_importer(_id, log_id=None):
    """Run importer by id."""
    from geosight.reference_dataset.importer import (
        ReferenceDatasetImporterTask
    )
    try:
        importer = ReferenceDatasetImporter.objects.get(id=_id)
        ReferenceDatasetImporterTask(importer).run()
    except ReferenceDatasetImporter.DoesNotExist:
        logger.error(f'Importer {_id} does not exist')
