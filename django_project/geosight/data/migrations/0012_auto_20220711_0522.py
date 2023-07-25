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
        ('geosight_data', '0011_auto_20220711_0414'),
    ]

    operations = [
        migrations.AddField(
            model_name='widget',
            name='visible_by_default',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='widget',
            name='dashboard',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='geosight_data.dashboard'),
        ),
    ]
