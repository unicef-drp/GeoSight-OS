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
__date__ = '22/10/2024'
__copyright__ = ('Copyright 2023, Unicef')

import logging
from datetime import timedelta

from django.urls import reverse
from django.utils import timezone
from uwsgi_tools.curl import curl

from core.celery import app
from core.models.preferences import SitePreferences
from geosight.machine_info_fetcher.models import MachineInfo

logger = logging.getLogger(__name__)
REMOVE_AFTER_DAYS = 14


@app.task
def trigger_storage_checker_api():
    """Task to trigger checker API calls."""
    pref = SitePreferences.preferences()
    config = pref.machine_info_fetcher_config
    if not config:
        return
    api_key = config.get('api_key', None)
    user_email = config.get('user_email', None)
    host = 'django:8080'
    endpoint_url = reverse('machine_info_fetcher.check_storage_usage')
    if not api_key or not user_email:
        return

    headers = (
        f'Authorization: Bearer {api_key}',
        f'GEOSIGHT_USER_KEY: {user_email}',
    )
    curl(host, endpoint_url, headers=headers)


@app.task
def clean_old_machine_info():
    """Task to clean old storage logs."""
    datetime_filter = timezone.now() - timedelta(days=REMOVE_AFTER_DAYS)
    MachineInfo.objects.filter(
        date_time__lte=datetime_filter
    ).delete()
