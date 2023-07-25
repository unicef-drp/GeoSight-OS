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

import requests

from django.db import migrations

from geosight.georepo.request import GeorepoRequest


def run(apps, schema_editor):
    # TODO:
    #  Move this to management command
    #  To prevent calling georepo on migrations
    return

    Indicator = apps.get_model("geosight_data", "Indicator")
    ReferenceLayer = apps.get_model("geosight_georepo", "ReferenceLayer")

    reference_layers = {}
    level_by_name = {}
    reference_layer_list = GeorepoRequest().get_reference_layer_list()
    for data in reference_layer_list:
        ref, created = ReferenceLayer.objects.get_or_create(
            identifier=data['identifier'])
        reference_layers[data['name']] = ref

        detail = requests.get(
            georepo.reference_layer_detail.replace(
                '<identifier>', data['identifier']
            )
        )
        for level in detail.json()['levels']:
            level_by_name[level['level_name']] = {
                'level': level['level'],
                'identifier': ref
            }

    for indicator in Indicator.objects.all():
        level = None
        reference_layer = None
        try:
            level_data = level_by_name[indicator.reporting_level]
            level = level_data['level']
            reference_layer = level_data['identifier']
        except KeyError:
            try:
                level = int(indicator.reporting_level)
            except ValueError:
                pass

        if indicator.group.name == 'Ukraine':
            reference_layer = reference_layers['Ukraine']

        indicator.indicatorvalue_set.update(
            reference_layer=reference_layer,
            admin_level=level
        )


class Migration(migrations.Migration):
    dependencies = [
        ('geosight_data', '0020_auto_20220803_0539')
    ]

    operations = [
        migrations.RunPython(run, migrations.RunPython.noop),
    ]
