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
        ('geosight_importer', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='ImporterMapping',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(help_text='The name of attribute', max_length=128)),
                ('value', models.TextField(blank=True, help_text='The value of attribute', null=True)),
                ('importer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='geosight_importer.importer')),
            ],
        ),
    ]
