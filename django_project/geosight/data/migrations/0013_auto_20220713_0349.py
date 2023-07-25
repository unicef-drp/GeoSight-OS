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
        ('geosight_data', '0012_auto_20220711_0522'),
    ]

    operations = [
        migrations.AddField(
            model_name='widget',
            name='group',
            field=models.CharField(blank=True, max_length=512, null=True),
        ),
        migrations.CreateModel(
            name='DashboardIndicator',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('order', models.IntegerField(default=0)),
                ('visible_by_default', models.BooleanField(default=False)),
                ('group', models.CharField(blank=True, max_length=512, null=True)),
                ('dashboard', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='geosight_data.dashboard')),
                ('object', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='geosight_data.indicator')),
            ],
            options={
                'ordering': ('order',),
            },
        ),
        migrations.CreateModel(
            name='DashboardContextLayer',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('order', models.IntegerField(default=0)),
                ('visible_by_default', models.BooleanField(default=False)),
                ('group', models.CharField(blank=True, max_length=512, null=True)),
                ('dashboard', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='geosight_data.dashboard')),
                ('object', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='geosight_data.contextlayer')),
            ],
            options={
                'ordering': ('order',),
            },
        ),
        migrations.CreateModel(
            name='DashboardBasemap',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('order', models.IntegerField(default=0)),
                ('visible_by_default', models.BooleanField(default=False)),
                ('group', models.CharField(blank=True, max_length=512, null=True)),
                ('dashboard', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='geosight_data.dashboard')),
                ('object', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='geosight_data.basemaplayer')),
            ],
            options={
                'ordering': ('order',),
            },
        ),
    ]
