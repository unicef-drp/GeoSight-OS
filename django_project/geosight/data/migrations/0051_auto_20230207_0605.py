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
        ('geosight_data', '0050_auto_20230118_0618'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='indicator',
            name='aggregation_method',
        ),
        migrations.AddField(
            model_name='indicator',
            name='aggregation_multiple_values',
            field=models.CharField(blank=True, default='COUNT(value)', help_text='Default aggregation for multiple values', max_length=64, null=True),
        ),
    ]
