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
        ('geosight_data', '0003_auto_20220621_0527'),
    ]

    operations = [
        migrations.AddField(
            model_name='indicatorrule',
            name='outline_color',
            field=models.CharField(default='#000000', help_text='Color for the outline of geometry on map.', max_length=16),
        ),
    ]
