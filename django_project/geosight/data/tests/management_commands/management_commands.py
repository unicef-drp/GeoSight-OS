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
__date__ = '05/07/2023'
__copyright__ = ('Copyright 2023, Unicef')

from django.core.management import call_command
from django_celery_beat.models import CrontabSchedule
from django.test.testcases import TestCase


class TestFixCrontabCommand(TestCase):
    """Test management command to fix CrontabSchedule."""

    def setUp(self):
        """Prepare test data."""
        timezone = 'UTC'
        CrontabSchedule.objects.create(
            minute='*',
            hour='*',
            day_of_month='*',
            month_of_year='*',
            day_of_week='*',
            timezone=timezone
        )

        CrontabSchedule.objects.create(
            minute='0/1',
            hour='*',
            day_of_month='*',
            month_of_year='1/1',
            day_of_week='*',
            timezone=timezone
        )

    def test_run(self):
        """Test running command.

        After command is ran, '1/1' and '0/1' value in
        CrontabSchedule will be replaced with '*'.
        """
        call_command('fix_crontab_schedule')
        self.assertEquals(
            CrontabSchedule.objects.filter(minute='0/1').count(), 0
        )

        self.assertEquals(
            CrontabSchedule.objects.filter(month_of_year='1/1').count(), 0
        )
