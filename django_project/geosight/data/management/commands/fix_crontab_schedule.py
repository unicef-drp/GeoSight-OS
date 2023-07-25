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

from django.core.management.base import BaseCommand
from django_celery_beat.models import CrontabSchedule


class Command(BaseCommand):
    """Fix crontab in job scheduler."""

    def handle(self, *args, **options):
        """Command handler."""
        fields = CrontabSchedule._meta.fields
        for schedule in CrontabSchedule.objects.all():
            print('---------------')
            print(f'Checking {schedule}')
            updated_fields = []
            for field in fields:
                if getattr(schedule, field.name) in ['1/1', '0/1']:
                    setattr(schedule, field.name, '*')
                    updated_fields.append(field.name)
            schedule.save()
            print(f'Updated fields: {updated_fields}')
