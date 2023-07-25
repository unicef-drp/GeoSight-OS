# coding=utf-8
from __future__ import unicode_literals

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


def run(apps, schema_editor):
    Dashboard = apps.get_model("geosight_data", "Dashboard")
    ReferenceLayer = apps.get_model("geosight_georepo", "ReferenceLayer")

    for dashboard in Dashboard.objects.all():
        if dashboard.reference_layer_identifier:
            if dashboard.reference_layer_identifier:
                reference_layer, created = ReferenceLayer.objects.get_or_create(
                    identifier=dashboard.reference_layer_identifier
                )
                dashboard.reference_layer = reference_layer
                dashboard.save()


class Migration(migrations.Migration):
    dependencies = [
        ('geosight_data', '0017_dashboard_reference_layer')
    ]

    operations = [
        migrations.RunPython(run, migrations.RunPython.noop),
    ]
