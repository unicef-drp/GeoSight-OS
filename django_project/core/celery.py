"""Celery config."""
from __future__ import absolute_import, unicode_literals

import os

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

from tenant_schemas_celery.app import CeleryApp as TenantAwareCeleryApp

# set the default Django settings module for the 'celery' program.
# this is also used in manage.py
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

# Get the base REDIS URL, default to redis' default
BASE_REDIS_URL = (
    f'redis://default:{os.environ.get("REDIS_PASSWORD", "")}'
    f'@{os.environ.get("REDIS_HOST", "")}',
)

app = TenantAwareCeleryApp('geosight')

# Using a string here means the worker don't have to serialize
# the configuration object to child processes.
# - namespace='CELERY' means all celery-related configuration keys
#   should have a `CELERY_` prefix.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django app configs.
app.autodiscover_tasks()

app.conf.broker_url = BASE_REDIS_URL

# this allows you to schedule items in the Django admin.
app.conf.beat_scheduler = 'django_celery_beat.schedulers.DatabaseScheduler'
