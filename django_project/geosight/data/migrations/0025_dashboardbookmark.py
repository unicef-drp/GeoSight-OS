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


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('geosight_data', '0024_dashboard_filters_allow_modify'),
    ]

    operations = [
        migrations.CreateModel(
            name='DashboardBookmark',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=512)),
                ('description', models.TextField(blank=True, null=True)),
                ('extent', django.contrib.gis.db.models.fields.PolygonField(blank=True, help_text='Extent of the dashboard. If empty, it is the whole map', null=True, srid=4326)),
                ('filters', models.TextField(blank=True, null=True)),
                ('creator', models.ForeignKey(blank=True, help_text='User who create the bookmark.', null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
                ('dashboard', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='geosight_data.dashboard')),
                ('selected_basemap', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='geosight_data.basemaplayer')),
                ('selected_context_layers', models.ManyToManyField(blank=True, to='geosight_data.ContextLayer')),
                ('selected_indicators', models.ManyToManyField(blank=True, to='geosight_data.Indicator')),
            ],
            options={
                'unique_together': {('dashboard', 'name')},
            },
        ),
    ]
