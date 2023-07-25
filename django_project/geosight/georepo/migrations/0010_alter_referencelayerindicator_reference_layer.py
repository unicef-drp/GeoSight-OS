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

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('geosight_georepo', '0009_delete_referencelayerindicator_data'),
    ]

    operations = [
        migrations.AlterField(
            model_name='referencelayerindicator',
            name='reference_layer',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                to='geosight_georepo.referencelayerview'),
        ),
    ]
