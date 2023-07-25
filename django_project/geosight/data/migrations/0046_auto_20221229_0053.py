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
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone
import uuid


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('geosight_data', '0045_override_style_migrations'),
    ]

    operations = [
        migrations.CreateModel(
            name='DashboardRelatedTable',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('order', models.IntegerField(default=0)),
                ('visible_by_default', models.BooleanField(default=False)),
                ('group', models.CharField(blank=True, max_length=512, null=True)),
                ('geography_code_field_name', models.TextField(blank=True, null=True)),
                ('selected_related_fields', models.JSONField(blank=True, null=True)),
                ('dashboard', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='geosight_data.dashboard')),
            ],
            options={
                'ordering': ('order',),
            },
        ),
        migrations.CreateModel(
            name='RelatedTable',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=512)),
                ('description', models.TextField(blank=True, null=True)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('modified_at', models.DateTimeField(auto_now=True)),
                ('unique_id', models.UUIDField(default=uuid.uuid4, editable=False)),
                ('creator', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='RelatedTableRow',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('order', models.IntegerField(default=0)),
                ('table', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='geosight_data.relatedtable')),
            ],
            options={
                'ordering': ('order',),
            },
        ),
        migrations.CreateModel(
            name='RelatedTableRowEAV',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(help_text='The name of attribute', max_length=100)),
                ('value', models.TextField(blank=True, help_text='The value of attribute', null=True)),
                ('row', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='geosight_data.relatedtablerow')),
            ],
            options={
                'unique_together': {('row', 'name')},
            },
        ),
        migrations.RemoveField(
            model_name='indicatorvalueextradetailrow',
            name='indicator_value',
        ),
        migrations.DeleteModel(
            name='IndicatorValueExtraDetailColumn',
        ),
        migrations.DeleteModel(
            name='IndicatorValueExtraDetailRow',
        ),
        migrations.AddField(
            model_name='dashboardrelatedtable',
            name='object',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='geosight_data.relatedtable'),
        ),
        migrations.AddField(
            model_name='dashboardrelatedtable',
            name='relation_group',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='geosight_data.dashboardrelationgroup'),
        ),
    ]
