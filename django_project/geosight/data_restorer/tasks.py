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
__date__ = '02/04/2026'
__copyright__ = ('Copyright 2023, Unicef')

from core.celery import app

from geosight.data_restorer.models import RequestRestoreData


@app.task
def run_request_restore_data(request_id):  # noqa: DOC101,DOC103
    """
    Run request restore data as a Celery task.

    Fetches the :class:`~geosight.data_restorer.models.RequestRestoreData`
    by ``request_id`` and calls its ``run()`` method.
    Does nothing if the record does not exist.

    :param request_id: Primary key of the ``RequestRestoreData`` to execute.
    :type request_id: int
    :return: None
    :rtype: None
    """
    try:
        request = RequestRestoreData.objects.get(id=request_id)
    except RequestRestoreData.DoesNotExist:
        return
    request.run()
