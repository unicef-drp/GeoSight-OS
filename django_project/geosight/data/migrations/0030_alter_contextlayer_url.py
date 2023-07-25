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
        ('geosight_data', '0029_auto_20220819_0309'),
    ]

    operations = [
        migrations.AlterField(
            model_name='contextlayer',
            name='url',
            field=models.CharField(help_text="Can put full url with parameters and system will use that. Or system will use 'CONTEXT LAYER PARAMETERS' if there is no parameters on the url.", max_length=10240),
        ),
    ]
