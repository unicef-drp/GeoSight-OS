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
        ('geosight_data', '0008_auto_20220710_0308'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='contextlayergroup',
            name='group',
        ),
        migrations.AlterField(
            model_name='contextlayer',
            name='password',
            field=models.CharField(blank=True, help_text='Password to access the layer if needed.', max_length=512, null=True),
        ),
        migrations.AlterField(
            model_name='contextlayer',
            name='token',
            field=models.CharField(blank=True, help_text='Token to access the layer if needed.', max_length=512, null=True),
        ),
        migrations.AlterField(
            model_name='contextlayer',
            name='username',
            field=models.CharField(blank=True, help_text='Username to access the layer if needed.', max_length=512, null=True),
        ),
    ]
