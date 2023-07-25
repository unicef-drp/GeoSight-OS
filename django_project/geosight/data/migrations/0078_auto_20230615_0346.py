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
    DashboardIndicatorLayer = apps.get_model(
        "geosight_data", "DashboardIndicatorLayer"
    )
    for indicator_layer in DashboardIndicatorLayer.objects.all():
        layer = DashboardIndicatorLayer.objects.raw(
            'SELECT id, use_popup_template FROM '
            'geosight_data_dashboardindicatorlayer WHERE '
            f'id={indicator_layer.id}'
        )[0]
        popup_type = 'Custom' if layer.use_popup_template else 'Simplified'
        indicator_layer.popup_type = popup_type
        indicator_layer.save()


class Migration(migrations.Migration):
    dependencies = [
        ('geosight_data', '0077_dashboard_truncate_indicator_layer_name'),
    ]

    operations = [
        migrations.AddField(
            model_name='dashboardindicatorlayer',
            name='popup_type',
            field=models.CharField(
                choices=[('Simplified', 'Simplified'), ('Custom', 'Custom')],
                default='Simplified', max_length=24),
        ),
        migrations.CreateModel(
            name='DashboardIndicatorLayerField',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True,
                                        serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=512)),
                ('alias', models.CharField(max_length=512)),
                ('visible', models.BooleanField(default=True)),
                ('type', models.CharField(default='string', max_length=512)),
                ('order', models.IntegerField(default=0)),
                ('as_label', models.BooleanField(default=False)),
                ('object',
                 models.ForeignKey(on_delete=django.db.models.deletion.CASCADE,
                                   to='geosight_data.dashboardindicatorlayer')),
            ],
            options={
                'unique_together': {('object', 'name')},
            },
        ),
        migrations.RunPython(run, migrations.RunPython.noop),
        migrations.RemoveField(
            model_name='dashboardindicatorlayer',
            name='use_popup_template',
        ),
    ]
