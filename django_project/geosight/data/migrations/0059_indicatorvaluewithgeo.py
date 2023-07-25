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
        ('geosight_data', '0058_indicator_value_with_geo'),
    ]

    operations = [
        migrations.CreateModel(
            name='IndicatorValueWithGeo',
            fields=[
                ('indicatorvalue_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='geosight_data.indicatorvalue')),
                ('admin_level', models.IntegerField(blank=True, null=True)),
                ('concept_uuid', models.CharField(blank=True, help_text='This is concept uuid from georepo.', max_length=256, null=True)),
            ],
            options={
                'db_table': 'v_indicator_value_geo',
                'ordering': ('-date',),
                'managed': False,
            },
            bases=('geosight_data.indicatorvalue',),
        ),
    ]
