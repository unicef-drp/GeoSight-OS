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
__date__ = '22/05/2025'
__copyright__ = ('Copyright 2025, Unicef')

from django.conf import settings
from django.core.management import call_command
from django.core.management.base import BaseCommand

from core.settings.utils import ABS_PATH
from geosight.data.models.dashboard import Dashboard


class Command(BaseCommand):
    """Load demo data fro geosight."""

    fixtures = [
        'core/fixtures/demo/1.core.json',
        'core/fixtures/demo/2.user_group.json',
        'core/fixtures/demo/3.geosight_georepo.json',
        (
            'geosight/reference_dataset/fixtures/test/'
            '4.reference_dataset_levels.json'
        ),
        'core/fixtures/demo/4.geosight_data.json',
        'core/fixtures/demo/5.geosight_permission.json',
    ]

    def handle(self, *args, **options):
        """Command handler."""
        for fixture in self.fixtures:
            call_command('loaddata', fixture)
        if settings.CLOUD_NATIVE_GIS_ENABLED:
            self.cloud_native_gis_fixtures()

    def cloud_native_gis_fixtures(self):
        """Cloud native GIS fixtures."""
        call_command(
            'loaddata', 'core/fixtures/demo/cloud_native_gis/1.init.json'
        )
        # Load the layer
        from cloud_native_gis.utils.geopandas import shapefile_to_postgis
        from cloud_native_gis.models.layer import Layer
        try:
            layer = Layer.objects.get(
                name='00000000-0000-0000-0000-000000000000',
            )
            filepath = ABS_PATH(
                'core', 'fixtures', 'demo', 'cloud_native_gis',
                'shapefile', 'somalia.shp'
            )
            shapefile_to_postgis(
                filepath=filepath,
                table_name=layer.table_name,
                schema_name=layer.schema_name,
            )
            dashboard = Dashboard.objects.get(
                slug='demo-geosight-project',
            )
            dashboard.context_layers_structure = {
                "id": "f23d6de0-ca62-41e5-95e0-d9f18acd458a",
                "group": "",
                "children": [
                    1, 2
                ]
            }
            dashboard.save()
        except Layer.DoesNotExist:
            print(
                'Later does not exist, please check your cloud native data.'
                'Need layer with name 00000000-0000-0000-0000-000000000000'
            )
        except Dashboard.DoesNotExist:
            print(
                'Dashboard does not exist,'
                ' need project with demo-geosight-project slug.'
            )
