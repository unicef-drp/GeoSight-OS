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


class Migration(migrations.Migration):

    dependencies = [
        ('geosight_data', '0037_auto_20220907_0325'),
    ]

    operations = [
        migrations.AddField(
            model_name='widget',
            name='date_filter_type',
            field=models.CharField(choices=[('No filter', 'No filter (global latest values will be used)'), ('Global datetime filter', 'Use datetime filter from Dashboard level.'), ('Custom filter', 'Use custom datetime filter.')], default='No filter', max_length=256),
        ),
        migrations.AddField(
            model_name='widget',
            name='date_filter_value',
            field=models.CharField(blank=True, max_length=256, null=True),
        ),
    ]
