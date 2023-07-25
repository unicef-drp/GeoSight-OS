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
        ('geosight_importer', '0009_alter_importer_input_format'),
    ]

    operations = [
        migrations.CreateModel(
            name='ImporterAlert',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('email', models.CharField(max_length=512)),
                ('on_start', models.BooleanField(default=False)),
                ('on_success', models.BooleanField(default=False)),
                ('on_failure', models.BooleanField(default=False)),
                ('importer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='geosight_importer.importer')),
            ],
            options={
                'unique_together': {('importer', 'email')},
            },
        ),
    ]
