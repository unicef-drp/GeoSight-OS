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

import json

from django.db import migrations
from rest_framework import serializers

from geosight.data.models.dashboard import DashboardIndicator
from geosight.data.models.indicator import IndicatorRule


class IndicatorRuleSerializer(serializers.ModelSerializer):
    """Serializer for IndicatorRule."""

    class Meta:  # noqa: D106
        model = IndicatorRule
        fields = ('name', 'rule', 'color', 'outline_color', 'order', 'active')


# TODO:
#  Move this to management
def run(apps, schema_editor):
    return

    # For dashboard
    for indicator in DashboardIndicator.objects.all():
        dashboard_style = indicator.dashboardindicatorrule_set.all()
        dashboard_style_str = json.dumps(
            IndicatorRuleSerializer(dashboard_style, many=True).data
        )
        indicator_style = indicator.object.indicatorrule_set.all()
        indicator_style_str = json.dumps(
            IndicatorRuleSerializer(indicator_style, many=True).data
        )
        if dashboard_style_str != indicator_style_str:
            indicator.override_style = True
            indicator.save()


class Migration(migrations.Migration):
    dependencies = [
        ('geosight_data', '0044_auto_20221216_0541')
    ]

    operations = [
        migrations.RunPython(run, migrations.RunPython.noop),
    ]
