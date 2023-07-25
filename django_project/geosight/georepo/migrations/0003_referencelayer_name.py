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
        ('geosight_georepo', '0002_referencelayerindicator'),
    ]

    operations = [
        migrations.AddField(
            model_name='referencelayer',
            name='name',
            field=models.CharField(blank=True, help_text='Reference layer name.', max_length=256, null=True),
        ),
    ]
