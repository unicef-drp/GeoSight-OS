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


def run(apps, schema_editor):
    ImporterLog = apps.get_model("geosight_importer", "ImporterLog")
    for log in ImporterLog.objects.all():
        if log.status == 'Error':
            log.status = 'Failed'
            log.save()
        if log.status == 'Done':
            log.status = 'Success'
            log.save()


class Migration(migrations.Migration):
    dependencies = [
        ('geosight_importer', '0005_auto_20230116_0850'),
    ]

    operations = [
        migrations.AlterField(
            model_name='importerlog',
            name='status',
            field=models.CharField(
                choices=[('Start', 'Start'), ('Running', 'Running'),
                         ('Failed', 'Failed'), ('Success', 'Success')],
                default='Start', max_length=100),
        ),
        migrations.RunPython(run, migrations.RunPython.noop),
    ]
