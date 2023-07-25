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
        ('geosight_importer', '0002_importermapping'),
    ]

    operations = [
        migrations.AlterField(
            model_name='importer',
            name='import_type',
            field=models.CharField(choices=[('Related Tables', 'Related Tables'), ('Indicator Value', 'Indicator Value')], default='Related Tables', help_text='Type of data that will be saved. It is between indicator value or related table.', max_length=128),
        ),
        migrations.AlterField(
            model_name='importer',
            name='input_format',
            field=models.CharField(choices=[('Excel Wide Format', 'Excel Wide Format'), ('Excel Long Format', 'Excel Long Format'), ('SharePoint Wide Format', 'SharePoint Wide Format'), ('SharePoint Long Format', 'SharePoint Long Format')], default='Excel Wide Format', help_text='Format of input. It will used for deciding what importer will be used.', max_length=128),
        ),
    ]
