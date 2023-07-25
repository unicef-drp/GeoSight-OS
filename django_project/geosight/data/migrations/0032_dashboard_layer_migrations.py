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
    DashboardIndicator = apps.get_model("geosight_data", "DashboardIndicator")
    DashboardIndicatorLayer = apps.get_model(
        "geosight_data", "DashboardIndicatorLayer")
    DashboardIndicatorLayerIndicator = apps.get_model(
        "geosight_data", "DashboardIndicatorLayerIndicator"
    )

    for dashboardIndicator in DashboardIndicator.objects.all():
        layer = DashboardIndicatorLayer.objects.create(
            dashboard=dashboardIndicator.dashboard,
            order=dashboardIndicator.order,
            visible_by_default=dashboardIndicator.visible_by_default,
            group=dashboardIndicator.group,
        )
        DashboardIndicatorLayerIndicator.objects.create(
            object=layer,
            indicator=dashboardIndicator.object
        )

class Migration(migrations.Migration):
    dependencies = [
        ('geosight_data', '0031_auto_20220823_0943')
    ]

    operations = [
        migrations.RunPython(run, migrations.RunPython.noop),
    ]
