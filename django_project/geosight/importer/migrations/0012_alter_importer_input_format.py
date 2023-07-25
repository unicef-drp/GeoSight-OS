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
        ('geosight_importer', '0011_alter_importer_input_format'),
    ]

    operations = [
        migrations.AlterField(
            model_name='importer',
            name='input_format',
            field=models.CharField(choices=[('Excel Wide Format', 'Excel Wide Format'), ('Excel Long Format', 'Excel Long Format'), ('SharePoint Wide Format', 'SharePoint Wide Format'), ('SharePoint Long Format', 'SharePoint Long Format'), ('API With Geography Wide Format', 'API With Geography Wide Format'), ('API With Geography Long Format', 'API With Geography Long Format'), ('Vector Context Layer Format', 'Vector Context Layer Format'), ('Related Table Format', 'Related Table Format'), ('SDMX Format', 'SDMX Format')], default='Excel Wide Format', help_text='Format of input. It will used for deciding what importer will be used.', max_length=128),
        ),
    ]
