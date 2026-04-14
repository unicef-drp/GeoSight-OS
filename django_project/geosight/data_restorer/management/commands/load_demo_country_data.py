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
__date__ = '14/04/2026'
__copyright__ = ('Copyright 2023, Unicef')

import os

from django.core.management.base import BaseCommand
from django.db.utils import IntegrityError

from core.settings.utils import ABS_PATH
from geosight.data_restorer.importers.dataset import DatasetImporter
from geosight.data_restorer.importers.indicator import IndicatorImporter
from geosight.data_restorer.importers.project import ProjectImporter

DATASET_FILE = ABS_PATH(
    'geosight', 'data_restorer', 'demo_data', 'datasets', '0001.countries.json'
)
INDICATOR_FILE = ABS_PATH(
    'geosight', 'data_restorer', 'demo_data', 'countries_data',
    '01.indicator.json'
)
PROJECT_FILE = ABS_PATH(
    'geosight', 'data_restorer', 'demo_data', 'countries_data',
    '02.project.json'
)


class Command(BaseCommand):
    """Load the bundled countries demo dataset as new records."""

    help = 'Import countries dataset and indicator demo data as new records.'

    def handle(self, *args, **options):
        """Command handler."""
        self.stdout.write(f'Importing {os.path.basename(DATASET_FILE)}...')
        try:
            reference_layer = DatasetImporter(DATASET_FILE).run()
            self.stdout.write(
                self.style.SUCCESS(
                    f'ReferenceLayerView created: '
                    f'"{reference_layer.name}" ({reference_layer.identifier})'
                )
            )
        except IntegrityError:
            self.stdout.write(
                self.style.SUCCESS(
                    f'Skipped as ReferenceLayerView already created')
            )

        self.stdout.write(f'Importing {os.path.basename(INDICATOR_FILE)}...')
        indicator = IndicatorImporter(INDICATOR_FILE).run()
        self.stdout.write(
            self.style.SUCCESS(
                f'Indicator created: '
                f'"{indicator.name}" ({indicator.shortcode})'
            )
        )

        self.stdout.write(f'Importing {os.path.basename(PROJECT_FILE)}...')
        project = ProjectImporter(PROJECT_FILE).run()
        self.stdout.write(
            self.style.SUCCESS(
                f'Project created: "{project.name}"'
            )
        )
