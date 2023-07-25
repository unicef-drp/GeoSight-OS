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
        ('geosight_data', '0030_alter_contextlayer_url'),
    ]

    operations = [
        migrations.CreateModel(
            name='DashboardIndicatorLayer',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('order', models.IntegerField(default=0)),
                ('visible_by_default', models.BooleanField(default=False)),
                ('group', models.CharField(blank=True, max_length=512, null=True)),
                ('name', models.CharField(blank=True, max_length=512, null=True)),
                ('description', models.TextField(blank=True, null=True)),
                ('style', models.TextField(blank=True, help_text='This is specifically used for multi indicators layer.For single layer, it will use rule of indicator', null=True)),
                ('dashboard', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='geosight_data.dashboard')),
            ],
            options={
                'ordering': ('order',),
            },
        ),
        migrations.AlterModelOptions(
            name='dashboardindicator',
            options={'ordering': ('object__name',)},
        ),
        migrations.CreateModel(
            name='DashboardIndicatorLayerIndicator',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('order', models.IntegerField(default=0)),
                ('name', models.CharField(blank=True, max_length=512, null=True)),
                ('color', models.CharField(blank=True, default='#000000', max_length=16, null=True)),
                ('indicator', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='geosight_data.indicator')),
                ('object', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='geosight_data.dashboardindicatorlayer')),
            ],
            options={
                'ordering': ('order',),
            },
        ),
    ]
