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
        ('geosight_georepo', '0004_alter_referencelayer_identifier'),
    ]

    operations = [
        migrations.CreateModel(
            name='Entity',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('admin_level', models.IntegerField(blank=True, null=True)),
                ('geom_id', models.CharField(help_text='This is ucode from georepo.', max_length=256)),
                ('reference_layer', models.ForeignKey(blank=True, help_text='Reference layer.', null=True, on_delete=django.db.models.deletion.SET_NULL, to='geosight_georepo.referencelayer')),
            ],
            options={
                'verbose_name_plural': 'entities',
                'unique_together': {('reference_layer', 'admin_level', 'geom_id')},
            },
        ),
        migrations.CreateModel(
            name='EntityCode',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('code', models.CharField(max_length=256)),
                ('code_type', models.CharField(max_length=256)),
                ('entity', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='geosight_georepo.entity')),
            ],
            options={
                'unique_together': {('entity', 'code', 'code_type')},
            },
        ),
    ]
