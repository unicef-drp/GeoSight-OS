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


def run(apps, schema_editor):
    return
    Dashboard = apps.get_model(
        "geosight_data", "Dashboard"
    )
    for dashboard in Dashboard.objects.all():
        if dashboard.reference_layer:
            dashboard.dataset_identifier = dashboard.reference_layer.identifier
            dashboard.save()


class Migration(migrations.Migration):
    dependencies = [
        ('geosight_data', '0054_dashboard_old_reference_layer'),
    ]

    operations = [
        migrations.RunPython(run, migrations.RunPython.noop),
    ]
