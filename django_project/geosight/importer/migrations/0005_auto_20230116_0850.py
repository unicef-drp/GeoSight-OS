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

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('django_celery_beat', '0016_alter_crontabschedule_timezone'),
        ('geosight_importer', '0004_remove_importer_admin_level'),
    ]

    operations = [
        migrations.RenameField(
            model_name='importer',
            old_name='name',
            new_name='job_name',
        ),
        migrations.RemoveField(
            model_name='importer',
            name='schedule_status',
        ),
        migrations.RemoveField(
            model_name='importer',
            name='schedule_type',
        ),
        migrations.AddField(
            model_name='importer',
            name='job',
            field=models.OneToOneField(blank=True, help_text='Scheduled task for the importer.', null=True, on_delete=django.db.models.deletion.SET_NULL, to='django_celery_beat.periodictask'),
        ),
        migrations.AddField(
            model_name='importer',
            name='run_on_create',
            field=models.BooleanField(default=True),
        ),
    ]
