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

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('geosight_data', '0004_indicatorrule_outline_color'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='referencelayer',
            name='geometries',
        ),
        migrations.AlterUniqueTogether(
            name='referencelayerlevel',
            unique_together=None,
        ),
        migrations.RemoveField(
            model_name='referencelayerlevel',
            name='level_name',
        ),
        migrations.RemoveField(
            model_name='referencelayerlevel',
            name='reference_layer',
        ),
        migrations.DeleteModel(
            name='Geometry',
        ),
        migrations.DeleteModel(
            name='GeometryLevelName',
        ),
        migrations.DeleteModel(
            name='ReferenceLayer',
        ),
        migrations.DeleteModel(
            name='ReferenceLayerLevel',
        ),
    ]
