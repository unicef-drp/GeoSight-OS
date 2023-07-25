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
        ('geosight_data', '0026_alter_dashboardbookmark_options'),
    ]

    operations = [
        migrations.CreateModel(
            name='ContextLayerField',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=512)),
                ('alias', models.CharField(max_length=512)),
                ('visible', models.BooleanField(default=True)),
                ('order', models.IntegerField(default=0)),
            ],
        ),
        migrations.CreateModel(
            name='DashboardContextLayerField',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=512)),
                ('alias', models.CharField(max_length=512)),
                ('visible', models.BooleanField(default=True)),
                ('order', models.IntegerField(default=0)),
            ],
        ),
        migrations.RemoveField(
            model_name='dashboardindicatorrule',
            name='indicator',
        ),
        migrations.AddField(
            model_name='contextlayer',
            name='styles',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='dashboardcontextlayer',
            name='styles',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.DeleteModel(
            name='ContextLayerStyle',
        ),
        migrations.AddField(
            model_name='dashboardcontextlayerfield',
            name='object',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='geosight_data.dashboardcontextlayer'),
        ),
        migrations.AddField(
            model_name='contextlayerfield',
            name='context_layer',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='geosight_data.contextlayer'),
        ),
        migrations.AlterUniqueTogether(
            name='dashboardcontextlayerfield',
            unique_together={('object', 'name')},
        ),
        migrations.AlterUniqueTogether(
            name='contextlayerfield',
            unique_together={('context_layer', 'name')},
        ),
    ]
