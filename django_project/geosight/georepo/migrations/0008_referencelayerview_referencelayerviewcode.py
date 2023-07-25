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
        ('geosight_georepo', '0007_entity_parents'),
    ]

    operations = [
        migrations.CreateModel(
            name='ReferenceLayerView',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('identifier', models.CharField(help_text='Reference layer identifier.', max_length=256)),
                ('name', models.CharField(blank=True, help_text='Reference layer name.', max_length=256, null=True)),
                ('description', models.TextField(blank=True, null=True)),
                ('in_georepo', models.BooleanField(default=True)),
            ],
        ),
        migrations.CreateModel(
            name='ReferenceLayerViewCode',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('admin_level', models.IntegerField(blank=True, null=True)),
                ('geom_id', models.CharField(help_text='This is ucode from georepo.', max_length=256)),
                ('view', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='geosight_georepo.referencelayerview')),
            ],
        ),
    ]
