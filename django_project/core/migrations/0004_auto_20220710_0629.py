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
        ('core', '0003_sitepreferencesimage'),
    ]

    operations = [
        migrations.AddField(
            model_name='sitepreferences',
            name='anti_primary_color',
            field=models.CharField(default='#FFFFFF', help_text='Anti of primary color that used for text in primary color.', max_length=16),
        ),
        migrations.AddField(
            model_name='sitepreferences',
            name='anti_secondary_color',
            field=models.CharField(default='#FFFFFF', help_text='Anti of secondary color that used for text in primary color.', max_length=16),
        ),
        migrations.AddField(
            model_name='sitepreferences',
            name='anti_tertiary_color',
            field=models.CharField(default='#FFFFFF', help_text='Anti of tertiary color that used for text in primary color.', max_length=16),
        ),
        migrations.AddField(
            model_name='sitepreferences',
            name='secondary_color',
            field=models.CharField(default='#374EA2', help_text='Secondary color that used for example for button. ', max_length=16),
        ),
        migrations.AddField(
            model_name='sitepreferences',
            name='tertiary_color',
            field=models.CharField(default='#297CC2', help_text='Tertiary color that used for example for some special place. ', max_length=16),
        ),
        migrations.AlterField(
            model_name='sitepreferences',
            name='primary_color',
            field=models.CharField(default='#1CABE2', help_text='Main color for the website. Put the hex color with # (e.g. #ffffff) or put the text of color. (e.g. blue)', max_length=16),
        ),
    ]
