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


def run(apps, schema_editor):
    IndicatorValue = apps.get_model("geosight_data", "IndicatorValue")
    for indicator_value in IndicatorValue.objects.all():
        indicator_value.original_geom_id = indicator_value.geom_id
        indicator_value.original_geom_id_type = 'PCode'
        indicator_value.save()


class Migration(migrations.Migration):
    dependencies = [
        ('geosight_data', '0049_alter_dashboardindicatorlayer_chart_style'),
    ]

    operations = [
        migrations.RenameField(
            model_name='indicatorvalue',
            old_name='geom_identifier',
            new_name='geom_id',
        ),
        migrations.AddField(
            model_name='indicatorvalue',
            name='original_geom_id',
            field=models.CharField(blank=True, help_text='This is the geometry id in any id type, example: UKR from PCode.', max_length=256, null=True),
        ),
        migrations.AddField(
            model_name='indicatorvalue',
            name='original_geom_id_type',
            field=models.CharField(blank=True, help_text='This is the id type for the original id, example: PCode.', max_length=256, null=True),
        ),
        migrations.AlterUniqueTogether(
            name='indicatorvalue',
            unique_together={('indicator', 'date', 'geom_id')},
        ),
        migrations.AlterField(
            model_name='indicatorvalue',
            name='geom_id',
            field=models.CharField(help_text='This is ucode from georepo.', max_length=256),
        ),
        migrations.RunPython(run, migrations.RunPython.noop),
    ]
