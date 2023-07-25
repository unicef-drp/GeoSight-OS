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
        ('geosight_data', '0037_auto_20220907_0325'),
        ('geosight_georepo', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='ReferenceLayerIndicator',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('indicator', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='geosight_data.indicator')),
                ('reference_layer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='geosight_georepo.referencelayer')),
            ],
            options={
                'unique_together': {('reference_layer', 'indicator')},
            },
        ),
    ]
