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

from frontend.views.admin.importer.form import (
    ImporterCreateView, ImporterEditView, ImporterScheduledEditView
)
from frontend.views.admin.importer.importer import ImporterDetailView
from frontend.views.admin.importer.log_data import ImporterLogDataView
from frontend.views.admin.importer.log_detail import ImporterLogDetailView
from frontend.views.admin.importer.logs import LogListView
from frontend.views.admin.importer.scheduled_job import ScheduledJobListView

logs_url = [
    url(
        r'^(?P<pk>\d+)/data',
        ImporterLogDataView.as_view(),
        name='admin-importer-log-data-view'
    ),
    url(
        r'^(?P<pk>\d+)',
        ImporterLogDetailView.as_view(),
        name='admin-importer-log-detail-view'
    ),
    url(
        r'',
        LogListView.as_view(),
        name='admin-importer-log-list-view'
    ),
]
scheduled_job_url = [
    url(
        r'^(?P<pk>\d+)/edit',
        ImporterScheduledEditView.as_view(),
        name='admin-scheduled-importer-edit-view'
    ),
    url(
        r'^(?P<pk>\d+)',
        ImporterDetailView.as_view(),
        name='admin-importer-detail-view'
    ),
    url(
        r'',
        ScheduledJobListView.as_view(),
        name='admin-scheduled-job-list-view'
    ),
]
job_url = [
    url(
        r'^(?P<pk>\d+)/edit',
        ImporterEditView.as_view(),
        name='admin-importer-edit-view'
    ),
]
urlpatterns = [
    url(r'logs/', include(logs_url)),
    url(r'job/', include(job_url)),
    url(r'scheduled-jobs/', include(scheduled_job_url)),
    url(
        r'',
        ImporterCreateView.as_view(),
        name='admin-importer-create-view'
    ),
]
