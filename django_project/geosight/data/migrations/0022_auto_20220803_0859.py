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

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('geosight_data', '0021_indicator_value_migration'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='indicator',
            name='aggregation_behaviour',
        ),
        migrations.RemoveField(
            model_name='indicator',
            name='dashboard_link',
        ),
        migrations.RemoveField(
            model_name='indicator',
            name='frequency',
        ),
        migrations.RemoveField(
            model_name='indicator',
            name='max_value',
        ),
        migrations.RemoveField(
            model_name='indicator',
            name='min_value',
        ),
        migrations.RemoveField(
            model_name='indicator',
            name='reporting_level',
        ),
        migrations.RemoveField(
            model_name='indicatorgroup',
            name='dashboard_link',
        ),
        migrations.DeleteModel(
            name='IndicatorFrequency',
        ),
    ]
