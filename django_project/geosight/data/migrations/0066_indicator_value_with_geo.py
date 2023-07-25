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

from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ('geosight_data', '0065_dashboardwidget'),
    ]

    sql = """
    DROP VIEW IF EXISTS v_indicator_value_geo;
    CREATE VIEW v_indicator_value_geo as
        SELECT value.*, date_part('day', value.date) as day, date_part('month', value.date) as month, date_part('year', value.date) as year, entity.concept_uuid, entity.reference_layer_id, entity.admin_level, indicator.type as indicator_type
        from geosight_data_indicatorvalue as value
             LEFT JOIN geosight_georepo_entity as entity ON value.geom_id = entity.geom_id
             LEFT JOIN geosight_data_indicator as indicator ON value.indicator_id = indicator.id;
    """

    sql_back = """
    DROP VIEW IF EXISTS v_indicator_value_geo;
    """

    operations = [
        migrations.RunSQL(sql, sql_back)
    ]
