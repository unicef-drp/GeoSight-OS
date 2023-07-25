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
        ('geosight_data', '0015_auto_20220713_0604'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='indicatorrule',
            options={'ordering': ('order',)},
        ),
        migrations.AddField(
            model_name='indicatorrule',
            name='order',
            field=models.IntegerField(default=0),
        ),
        migrations.CreateModel(
            name='DashboardIndicatorRule',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=512)),
                ('rule', models.CharField(help_text='Use formula to create the rule and use x as the value.Example: x<100. It will replace x with the value and will check the condition.', max_length=256)),
                ('color', models.CharField(blank=True, help_text='Color of the rule', max_length=16, null=True)),
                ('outline_color', models.CharField(default='#000000', help_text='Color for the outline of geometry on map.', max_length=16)),
                ('order', models.IntegerField(default=0)),
                ('indicator', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='geosight_data.indicator')),
                ('object', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='geosight_data.dashboardindicator')),
            ],
            options={
                'ordering': ('order',),
                'unique_together': {('object', 'name')},
            },
        ),
    ]
