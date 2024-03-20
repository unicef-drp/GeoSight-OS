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

    initial = True

    dependencies = [
        ('geosight_georepo', '0004_alter_referencelayer_identifier'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Importer',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('modified_at', models.DateTimeField(auto_now=True)),
                ('unique_id', models.UUIDField(default=uuid.uuid4, editable=False)),
                ('name', models.CharField(blank=True, max_length=512, null=True)),
                ('import_type', models.CharField(choices=[('Related Tables', 'Related Tables')], default='Related Tables', help_text='Type of data that will be saved. It is between indicator value or related table.', max_length=128)),
                ('input_format', models.CharField(choices=[('Excel Wide Format', 'Excel Wide Format')], default='Excel Wide Format', help_text='Format of input. It will used for deciding what importer will be used.', max_length=128)),
                ('schedule_type', models.CharField(choices=[('Single Import', 'Single Import')], default='Single Import', help_text='Is the importer scheduled jobs or single import.', max_length=128)),
                ('schedule_status', models.CharField(choices=[('Active', 'Active'), ('Paused', 'Paused')], default='Active', help_text='Is the importer scheduled active or paused.', max_length=128)),
                ('admin_level', models.IntegerField(blank=True, default=0, null=True)),
                ('creator', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('reference_layer', models.ForeignKey(blank=True, help_text='Reference layer.', null=True, on_delete=django.db.models.deletion.SET_NULL, to='geosight_georepo.referencelayerview')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='ImporterLog',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('start_time', models.DateTimeField(auto_now_add=True)),
                ('end_time', models.DateTimeField(blank=True, null=True)),
                ('progress', models.IntegerField(default=0)),
                ('status', models.CharField(choices=[('Start', 'Start'), ('Running', 'Running'), ('Error', 'Error'), ('Done', 'Done')], default='Start', max_length=100)),
                ('note', models.TextField(blank=True, null=True)),
                ('importer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='geosight_importer.importer')),
            ],
            options={
                'ordering': ('-start_time',),
            },
        ),
        migrations.CreateModel(
            name='ImporterLogData',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('data', models.JSONField()),
                ('note', models.JSONField(null=True)),
                ('saved', models.BooleanField(default=False, help_text='Is the data saved to actual model.')),
                ('log', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='geosight_importer.importerlog')),
            ],
        ),
        migrations.CreateModel(
            name='ImporterAttribute',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(help_text='The name of attribute', max_length=128)),
                ('value', models.TextField(blank=True, help_text='The value of attribute', null=True)),
                ('file', models.FileField(blank=True, help_text='The file of attribute', null=True, upload_to='importers/attributes')),
                ('importer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='geosight_importer.importer')),
            ],
            options={
                'unique_together': {('importer', 'name')},
            },
        ),
    ]
