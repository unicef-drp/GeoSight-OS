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

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='SitePreferences',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('site_title', models.CharField(default='', max_length=512)),
                ('primary_color', models.CharField(blank=True, default='#1CABE2', help_text='Put the hex color with # (e.g. #ffffff) or put the text of color. (e.g. blue)', max_length=16, null=True)),
                ('icon', models.FileField(blank=True, null=True, upload_to='settings/icons')),
                ('favicon', models.FileField(blank=True, null=True, upload_to='settings/icons')),
            ],
            options={
                'verbose_name_plural': 'site preferences',
            },
        ),
    ]
