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
        ('core', '0002_auto_20220621_0516'),
    ]

    operations = [
        migrations.CreateModel(
            name='SitePreferencesImage',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('image', models.FileField(upload_to='settings/images')),
                ('title', models.CharField(blank=True, help_text='Title of image.', max_length=256, null=True)),
                ('description', models.TextField(blank=True, help_text='Description of image.', null=True)),
                ('preference', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='core.sitepreferences')),
            ],
        ),
    ]
