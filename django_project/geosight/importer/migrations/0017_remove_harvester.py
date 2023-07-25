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
        ('geosight_importer',
         '0016_alter_importerlogdatasaveprogress_saved_ids'),
    ]

    functions = """
            DROP TABLE IF EXISTS geosight_permission_harvestergrouppermission;
            DROP TABLE IF EXISTS geosight_permission_harvesteruserpermission;
            DROP TABLE IF EXISTS geosight_permission_harvesterpermission;
            DROP TABLE IF EXISTS geosight_harvester_harvestermappingvalue;
            DROP TABLE IF EXISTS geosight_harvester_harvesterlog;
            DROP TABLE IF EXISTS geosight_harvester_harvesterattribute;
            DROP TABLE IF EXISTS geosight_harvester_harvester;
    """

    operations = [
        migrations.RunSQL(functions, migrations.RunPython.noop),
    ]
