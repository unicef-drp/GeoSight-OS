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
        ('geosight_data', '0005_auto_20220623_0944'),
    ]

    operations = [
        migrations.CreateModel(
            name='IndicatorValueExtraDetailRow',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('indicator_value', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='geosight_data.indicatorvalue')),
            ],
        ),
        migrations.CreateModel(
            name='IndicatorValueExtraDetailColumn',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(help_text='The name of column', max_length=100)),
                ('value', models.TextField(default=True, help_text='The value of cell', null=True)),
                ('row', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='geosight_data.indicatorvalueextradetailrow')),
            ],
            options={
                'unique_together': {('row', 'name')},
            },
        ),
    ]
