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

from django_celery_beat.models import PeriodicTask, CrontabSchedule

from geosight.importer.exception import ImporterError
from geosight.importer.form import ImporterForm
from geosight.importer.models import (
    ImportType, InputFormat, ScheduleType
)
from geosight.importer.tests.importers._base import BaseImporterTest


class ScheduleImporterTest(BaseImporterTest):
    """Test for scheduled importer."""

    def setUp(self):
        """To setup tests."""
        super().setUp()
        self.data = {
            'creator': self.user,
            'import_type': ImportType.INDICATOR_VALUE,
            'input_format': InputFormat.SHAREPOINT_EXCEL_LONG,
            'reference_layer': self.reference_layer
        }

    def test_no_schedule(self):
        """Test if correct importer."""
        form = ImporterForm(self.data)
        self.assertTrue(form.is_valid())
        importer = form.save()
        self.assertIsNone(importer.job)
        self.assertEqual(
            importer.schedule_type, ScheduleType.SINGLE_IMPORT
        )
        self.assertEqual(importer.job_active, None)
        self.assertEqual(PeriodicTask.objects.count(), 0)
        self.assertEqual(CrontabSchedule.objects.count(), 0)

    def test_error_schedule(self):
        """Test if correct importer."""
        with self.assertRaises(ImporterError):
            form = ImporterForm(self.data)
            self.assertTrue(form.is_valid())
            importer = form.save()
            importer.change_job('12 * * * * * *')
        self.assertEqual(PeriodicTask.objects.count(), 0)
        self.assertEqual(CrontabSchedule.objects.count(), 0)

    def test_schedule(self):
        """Test if correct importer."""
        self.data.update({'job_name': 'test'})
        form = ImporterForm(self.data)
        self.assertTrue(form.is_valid())
        importer = form.save()
        importer.change_job('12 11 3 10 1 Africa/Johannesburg')
        self.assertIsNotNone(importer.job)
        self.assertEqual(
            importer.schedule_type, ScheduleType.SCHEDULED_IMPORT
        )
        self.assertEqual(importer.job_name, 'test')
        self.assertEqual(importer.job_active, True)
        self.assertEqual(importer.schedule, '12 11 3 10 1 Africa/Johannesburg')
        self.assertEqual(PeriodicTask.objects.count(), 1)
        self.assertEqual(CrontabSchedule.objects.count(), 1)

        self.assertEqual(importer.job.crontab.minute, '12')
        self.assertEqual(importer.job.crontab.hour, '11')
        self.assertEqual(importer.job.crontab.day_of_month, '3')
        self.assertEqual(importer.job.crontab.month_of_year, '10')
        self.assertEqual(importer.job.crontab.day_of_week, '1')

    def test_change_schedule(self):
        """Test if correct importer."""
        self.data.update({'job_name': 'test'})
        form = ImporterForm(self.data)
        self.assertTrue(form.is_valid())
        importer = form.save()
        importer.change_job('12 11 3 10 1 Africa/Johannesburg')
        self.assertIsNotNone(importer.job)
        self.assertEqual(
            importer.schedule_type, ScheduleType.SCHEDULED_IMPORT
        )
        self.assertEqual(importer.job_name, 'test')
        self.assertEqual(importer.job_active, True)
        self.assertEqual(importer.schedule, '12 11 3 10 1 Africa/Johannesburg')
        self.assertEqual(PeriodicTask.objects.count(), 1)
        self.assertEqual(CrontabSchedule.objects.count(), 1)

        self.assertEqual(importer.job.crontab.minute, '12')
        self.assertEqual(importer.job.crontab.hour, '11')
        self.assertEqual(importer.job.crontab.day_of_month, '3')
        self.assertEqual(importer.job.crontab.month_of_year, '10')
        self.assertEqual(importer.job.crontab.day_of_week, '1')
        self.assertEqual(
            importer.job.crontab.timezone.key, 'Africa/Johannesburg'
        )

        # Change the schedule
        importer.change_job('1 2 3 4 5 UTC')
        self.assertIsNotNone(importer.job)
        self.assertEqual(
            importer.schedule_type, ScheduleType.SCHEDULED_IMPORT
        )
        self.assertEqual(importer.job_name, 'test')
        self.assertEqual(importer.job_active, True)
        self.assertEqual(importer.schedule, '1 2 3 4 5 UTC')
        self.assertEqual(PeriodicTask.objects.count(), 1)
        self.assertEqual(CrontabSchedule.objects.count(), 1)

        self.assertEqual(importer.job.crontab.minute, '1')
        self.assertEqual(importer.job.crontab.hour, '2')
        self.assertEqual(importer.job.crontab.day_of_month, '3')
        self.assertEqual(importer.job.crontab.month_of_year, '4')
        self.assertEqual(importer.job.crontab.day_of_week, '5')
        self.assertEqual(importer.job.crontab.timezone.key, 'UTC')
