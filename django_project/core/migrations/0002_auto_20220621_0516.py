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
        ('core', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='sitepreferences',
            name='georepo_api_key',
            field=models.CharField(blank=True, max_length=512, null=True),
        ),
        migrations.AddField(
            model_name='sitepreferences',
            name='georepo_url',
            field=models.CharField(default='https://staging.georepo.kartoza.com/', max_length=512),
        ),
        migrations.AlterField(
            model_name='sitepreferences',
            name='primary_color',
            field=models.CharField(default='#1CABE2', help_text='Theme color for the website. Put the hex color with # (e.g. #ffffff) or put the text of color. (e.g. blue)', max_length=16),
        ),
    ]
