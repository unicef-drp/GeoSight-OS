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
        ('core', '0007_geosightgroup'),
    ]

    operations = [
        migrations.AddField(
            model_name='sitepreferences',
            name='indicator_no_data_fill_color',
            field=models.CharField(default='#D8D8D8', help_text='Fill color for indicator no data.', max_length=16),
        ),
        migrations.AddField(
            model_name='sitepreferences',
            name='indicator_no_data_outline_color',
            field=models.CharField(default='#000000', help_text='Outline color for indicator no data.', max_length=16),
        ),
        migrations.AddField(
            model_name='sitepreferences',
            name='indicator_other_data_fill_color',
            field=models.CharField(default='#A6A6A6', help_text='Fill color for indicator other data.', max_length=16),
        ),
        migrations.AddField(
            model_name='sitepreferences',
            name='indicator_other_data_outline_color',
            field=models.CharField(default='#000000', help_text='Outline color for indicator other data.', max_length=16),
        ),
    ]
