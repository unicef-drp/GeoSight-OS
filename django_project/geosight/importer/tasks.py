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
from geosight.importer.models import (
    Importer, ImporterLog, ImporterLogDataSaveProgress
)

logger = get_task_logger(__name__)


@app.task
def run_importer(_id, log_id=None):
    """Run importer by id."""
    try:
        importer = Importer.objects.get(id=_id)
        log = None
        if log_id:
            log = ImporterLog.objects.get(id=log_id)
    except Importer.DoesNotExist:
        logger.error(f'Importer {_id} does not exist')
    except ImporterLog.DoesNotExist:
        logger.error(f'Importer log {log_id} does not exist')
    else:
        importer.run(log=log)


@app.task
def run_save_log_data(_id):
    """Run importer by id."""
    try:
        progress = ImporterLogDataSaveProgress.objects.get(id=_id)
        progress.run()
    except ImporterLogDataSaveProgress.DoesNotExist:
        pass


@app.task
def calculate_data_counts(_id):
    """Calculate data counts."""
    log = ImporterLog.objects.get(id=_id)
    log_datas = log.importerlogdata_set.all()
    success_log_datas = log_datas.filter(saved=True)
    log.total_count = log_datas.count()
    log.success_count = success_log_datas.count()
    log.save()
