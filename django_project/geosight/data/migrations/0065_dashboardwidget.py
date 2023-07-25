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


def run(apps, schema_editor):
    Widget = apps.get_model("geosight_data", "Widget")
    DashboardWidget = apps.get_model("geosight_data", "DashboardWidget")
    for widget in Widget.objects.all():
        layer_id = None
        if widget.indicator:
            layer_id = widget.indicator.id
        if widget.context_layer:
            layer_id = widget.context_layer.id
        dashboard_widget = DashboardWidget(
            name=widget.name,
            description=widget.description,
            dashboard=widget.dashboard,
            order=widget.order,
            visible_by_default=widget.visible_by_default,
            group=widget.group,
            relation_group=widget.relation_group,
            type=widget.type,
            config={
                'unit': widget.unit,
                'property': widget.property,
                'property_2': widget.property_2,
                'operation': widget.operation,
                'layer_used': widget.layer_used,
                'layer_id': layer_id,
                'date_filter_value': widget.date_filter_value,
            }
        )
        dashboard_widget.save()


class Migration(migrations.Migration):
    dependencies = [
        ('geosight_data', '0064_dashboard_geo_field'),
    ]

    operations = [
        migrations.CreateModel(
            name='DashboardWidget',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True,
                                        serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=512)),
                ('description', models.TextField(blank=True, null=True)),
                ('order', models.IntegerField(default=0)),
                ('visible_by_default', models.BooleanField(default=False)),
                ('group',
                 models.CharField(blank=True, max_length=512, null=True)),
                ('config', models.JSONField()),
                ('dashboard',
                 models.ForeignKey(on_delete=django.db.models.deletion.CASCADE,
                                   to='geosight_data.dashboard')),
                ('relation_group', models.ForeignKey(blank=True, null=True,
                                                     on_delete=django.db.models.deletion.SET_NULL,
                                                     to='geosight_data.dashboardrelationgroup')),
                ('type', models.CharField(default='SummaryWidget', max_length=256)),
            ],
            options={
                'ordering': ('order',),
            },
        ),
        migrations.RunPython(run, migrations.RunPython.noop),
    ]
