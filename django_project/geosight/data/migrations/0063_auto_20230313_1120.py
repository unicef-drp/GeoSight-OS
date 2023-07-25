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

from django.conf import settings
import django.contrib.gis.db.models.fields
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('geosight_data', '0062_dashboardrelatedtable_geography_code_type'),
    ]

    operations = [
        migrations.AddField(
            model_name='dashboardbookmark',
            name='context_layer_show',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='dashboardbookmark',
            name='indicator_layer_show',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='dashboardbookmark',
            name='is_3d_mode',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='dashboardbookmark',
            name='position',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='dashboardbookmark',
            name='selected_admin_level',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.CreateModel(
            name='DashboardEmbed',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('modified_at', models.DateTimeField(auto_now=True)),
                ('extent', django.contrib.gis.db.models.fields.PolygonField(blank=True, help_text='Extent of the dashboard. If empty, it is the whole map', null=True, srid=4326)),
                ('filters', models.TextField(blank=True, null=True)),
                ('indicator_layer_show', models.BooleanField(default=True)),
                ('context_layer_show', models.BooleanField(default=True)),
                ('selected_admin_level', models.FloatField(blank=True, null=True)),
                ('is_3d_mode', models.BooleanField(default=False)),
                ('position', models.JSONField(blank=True, null=True)),
                ('code', models.TextField(max_length=16, unique=True)),
                ('layer_tab', models.BooleanField(default=True)),
                ('filter_tab', models.BooleanField(default=True)),
                ('map', models.BooleanField(default=True)),
                ('widget_tab', models.BooleanField(default=True)),
                ('creator', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('dashboard', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='geosight_data.dashboard')),
                ('selected_basemap', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='geosight_data.basemaplayer')),
                ('selected_context_layers', models.ManyToManyField(blank=True, to='geosight_data.ContextLayer')),
                ('selected_indicator_layer', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='geosight_data.dashboardindicatorlayer')),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
