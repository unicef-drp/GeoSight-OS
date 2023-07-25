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

from geosight.data.models.related_table import RelatedTableRow


def run(apps, schema_editor):
    queries = RelatedTableRow.objects.all()
    count = queries.count()
    for idx, row in enumerate(queries):
        print(f'{idx}/{count}')
        row.data = row.data_from_eav_model
        row.save()


class Migration(migrations.Migration):
    dependencies = [
        ('geosight_data', '0060_indicator_value_with_geo'),
    ]

    operations = [
        migrations.AddField(
            model_name='relatedtablerow',
            name='data',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.RunPython(run, migrations.RunPython.noop),
    ]
