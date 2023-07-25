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
        ('geosight_data', '0046_auto_20221229_0053'),
    ]

    operations = [
        migrations.RenameField(
            model_name='dashboardindicatorlayer',
            old_name='style',
            new_name='chart_style',
        ),
        migrations.CreateModel(
            name='DashboardIndicatorLayerRelatedTable',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('style_type', models.CharField(choices=[('Predefined style/color rules.', 'Predefined style/color rules.'), ('Style from library.', 'Style from library.')], default='Predefined style/color rules.', max_length=256)),
                ('order', models.IntegerField(default=0)),
                ('name', models.CharField(blank=True, max_length=512, null=True)),
                ('color', models.CharField(blank=True, default='#000000', max_length=16, null=True)),
                ('object', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='geosight_data.dashboardindicatorlayer')),
                ('related_table', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='geosight_data.relatedtable')),
                ('style', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='geosight_data.style')),
            ],
            options={
                'ordering': ('order',),
            },
        ),
        migrations.CreateModel(
            name='DashboardIndicatorLayerConfig',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(help_text='The name of attribute', max_length=100)),
                ('value', models.TextField(default=True, help_text='The value of attribute', null=True)),
                ('layer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='geosight_data.dashboardindicatorlayer')),
            ],
        ),
        migrations.CreateModel(
            name='DashboardIndicatorLayerRelatedTableRule',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=512)),
                ('rule', models.CharField(help_text='Use formula to create the rule and use x as the value.Example: x<100. It will replace x with the value and will check the condition.', max_length=256)),
                ('color', models.CharField(blank=True, help_text='Color of the rule', max_length=16, null=True)),
                ('outline_color', models.CharField(default='#000000', help_text='Color for the outline of geometry on map.', max_length=16)),
                ('order', models.IntegerField(default=0)),
                ('active', models.BooleanField(default=True)),
                ('object', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='geosight_data.dashboardindicatorlayerrelatedtable')),
            ],
            options={
                'ordering': ('order',),
                'unique_together': {('object', 'name')},
            },
        ),
    ]
