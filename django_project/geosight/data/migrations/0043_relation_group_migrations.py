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
    DashboardRelationGroup = apps.get_model("geosight_data", "DashboardRelationGroup")
    DashboardBasemap = apps.get_model("geosight_data", "DashboardBasemap")
    DashboardContextLayer = apps.get_model("geosight_data", "DashboardContextLayer")
    DashboardIndicatorLayer = apps.get_model("geosight_data", "DashboardIndicatorLayer")
    Widget = apps.get_model("geosight_data", "Widget")
    indicators = DashboardIndicator.objects.exclude(
        group=''
    )
    basemaps = DashboardBasemap.objects.exclude(
        group=''
    )
    dashboard_indicators = DashboardIndicatorLayer.objects.exclude(
        group=''
    )
    context_layers = DashboardContextLayer.objects.exclude(
        group=''
    )
    widgets = Widget.objects.exclude(
        group=''
    )
    for indicator in indicators:
        group, _ = DashboardRelationGroup.objects.get_or_create(
            name=indicator.group
        )
        indicator.relation_group = group
        indicator.save()
    for basemap in basemaps:
        group, _ = DashboardRelationGroup.objects.get_or_create(
            name=basemap.group
        )
        basemap.relation_group = group
        basemap.save()
    for context_layer in context_layers:
        group, _ = DashboardRelationGroup.objects.get_or_create(
            name=context_layer.group
        )
        context_layer.relation_group = group
        context_layer.save()
    for widget in widgets:
        group, _ = DashboardRelationGroup.objects.get_or_create(
            name=widget.group
        )
        widget.relation_group = group
        widget.save()
    for dashboard_indicator in dashboard_indicators:
        group, _ = DashboardRelationGroup.objects.get_or_create(
            name=dashboard_indicator.group
        )
        dashboard_indicator.relation_group = group
        dashboard_indicator.save()


class Migration(migrations.Migration):

    dependencies = [
        ('geosight_data', '0042_auto_20221208_0735'),
    ]

    operations = [
        migrations.RunPython(run, migrations.RunPython.noop),
    ]
