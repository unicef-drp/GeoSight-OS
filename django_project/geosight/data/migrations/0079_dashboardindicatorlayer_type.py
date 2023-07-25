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
__date__ = '28/06/2023'
__copyright__ = ('Copyright 2023, Unicef')

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('geosight_data', '0078_auto_20230615_0346'),
    ]

    operations = [
        migrations.AddField(
            model_name='dashboardindicatorlayer',
            name='type',
            field=models.CharField(
                choices=[
                    ('Single Indicator', 'Single Indicator'),
                    ('Multi Indicator', 'Multi Indicator'),
                    ('Dynamic Indicator', 'Dynamic Indicator'),
                    ('Related Table', 'Related Table')
                ],
                default='Single Indicator', max_length=48),
        ), migrations.AddField(
            model_name='dashboardindicatorlayer',
            name='label_config',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='dashboardindicatorlayer',
            name='override_label',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='dashboardindicatorlayer',
            name='override_style',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='dashboardindicatorlayer',
            name='style',
            field=models.ForeignKey(blank=True, null=True,
                                    on_delete=django.db.models.deletion.SET_NULL,
                                    to='geosight_data.style'),
        ),
        migrations.AddField(
            model_name='dashboardindicatorlayer',
            name='style_type',
            field=models.CharField(choices=[('Predefined style/color rules.',
                                             'Predefined style/color rules.'),
                                            ('Style from library.',
                                             'Style from library.')],
                                   default='Predefined style/color rules.',
                                   max_length=256),
        ),
        migrations.CreateModel(
            name='DashboardIndicatorLayerRule',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True,
                                        serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=512)),
                ('rule', models.CharField(
                    help_text='Use formula to create the rule and use x as the value.Example: x<100. It will replace x with the value and will check the condition.',
                    max_length=256)),
                ('color',
                 models.CharField(blank=True, help_text='Color of the rule',
                                  max_length=16, null=True)),
                ('outline_color', models.CharField(default='#000000',
                                                   help_text='Color for the outline of geometry on map.',
                                                   max_length=16)),
                ('order', models.IntegerField(default=0)),
                ('active', models.BooleanField(default=True)),
                ('object',
                 models.ForeignKey(on_delete=django.db.models.deletion.CASCADE,
                                   to='geosight_data.dashboardindicatorlayer')),
            ],
            options={
                'ordering': ('order',),
                'unique_together': {('object', 'name')},
            },
        ),
    ]
