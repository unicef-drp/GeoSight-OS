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

from django.conf.urls import url
from django.urls import include

from geosight.importer.api.importer import (
    ImporterDetailAPI, ImporterRunAPI,
    ImporterJobResumeAPI, ImporterJobPauseAPI
)
from geosight.importer.api.log import (
    ImporterLogListAPI, ImporterLogDetailAPI,
)
from geosight.importer.api.log_data import (
    ImporterLogDataAPI, ImporterLogDataIdsAPI, ImporterLogDataProgresAPI
)
from geosight.importer.api.scheduled_job import ScheduleJobListAPI

importer_log_api = [
    url(
        r'^list',
        ImporterLogListAPI.as_view(), name='importer-log-list-api'
    ),
    url(
        r'^(?P<pk>\d+)/data/progress',
        ImporterLogDataProgresAPI.as_view(),
        name='importer-log-data-save-progress-api'
    ),
    url(
        r'^(?P<pk>\d+)/data/ids',
        ImporterLogDataIdsAPI.as_view(), name='importer-log-data-ids-api'
    ),
    url(
        r'^(?P<pk>\d+)/data',
        ImporterLogDataAPI.as_view(), name='importer-log-data-api'
    ),
    url(
        r'^(?P<pk>\d+)',
        ImporterLogDetailAPI.as_view(), name='importer-log-detail-api'
    ),
]
scheduled_job_api = [
    url(
        r'^list',
        ScheduleJobListAPI.as_view(), name='scheduled-job-list-api'
    ),
    url(
        r'^(?P<pk>\d+)/run',
        ImporterRunAPI.as_view(), name='importer-run-api'
    ),
    url(
        r'^(?P<pk>\d+)/pause',
        ImporterJobPauseAPI.as_view(), name='importer-pause-api'
    ),
    url(
        r'^(?P<pk>\d+)/resume',
        ImporterJobResumeAPI.as_view(), name='importer-resume-api'
    ),
    url(
        r'^(?P<pk>\d+)',
        ImporterDetailAPI.as_view(), name='importer-detail-api'
    ),
]
urlpatterns = [
    url(r'^log/', include(importer_log_api)),
    url(r'^scheduled-job/', include(scheduled_job_api)),
]
