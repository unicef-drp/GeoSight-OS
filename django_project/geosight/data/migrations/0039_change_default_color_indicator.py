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

from core.models.preferences import SitePreferences
from geosight.data.models.dashboard import DashboardIndicatorRule
from geosight.data.models.indicator import IndicatorRule


def run(apps, schema_editor):
    preferences = SitePreferences.load()
    DashboardIndicatorRule.objects.filter(rule='No data').update(
        color=preferences.style_no_data_fill_color,
        outline_color=preferences.style_no_data_outline_color
    )
    DashboardIndicatorRule.objects.filter(rule='Other data').update(
        color=preferences.style_other_data_fill_color,
        outline_color=preferences.style_other_data_outline_color
    )
    IndicatorRule.objects.filter(rule='No data').update(
        color=preferences.style_no_data_fill_color,
        outline_color=preferences.style_no_data_outline_color
    )
    IndicatorRule.objects.filter(rule='Other data').update(
        color=preferences.style_other_data_fill_color,
        outline_color=preferences.style_other_data_outline_color
    )


class Migration(migrations.Migration):
    dependencies = [
        ('geosight_data', '0038_auto_20221014_0632'),
        ('core', '0008_auto_20221103_0407')
    ]

    operations = [
        migrations.RunPython(run, migrations.RunPython.noop),
    ]
