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
        ('geosight_importer', '0006_alter_importerlog_status'),
    ]

    operations = [
        migrations.AddField(
            model_name='importer',
            name='admin_code_type',
            field=models.CharField(blank=True, default='ucode', help_text='The code type of the data.', max_length=512, null=True),
        ),
    ]
