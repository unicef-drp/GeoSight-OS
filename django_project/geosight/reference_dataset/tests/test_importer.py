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
__date__ = '06/03/2025'
__copyright__ = ('Copyright 2025, Unicef')

import os

from django.contrib.auth import get_user_model
from django.core.files import File

from core.settings.utils import ABS_PATH
from core.tests.base_tests import TestCase
from geosight.georepo.tests.model_factories import ReferenceLayerF
from geosight.reference_dataset.importer import (
    ReferenceDatasetImporterTask
)
from geosight.reference_dataset.models.reference_dataset import (
    ReferenceDatasetLevel
)
from geosight.reference_dataset.models.reference_dataset_importer import (
    ReferenceDatasetImporter, ReferenceDatasetImporterLevel, LogStatus
)

User = get_user_model()


class ImporterTest(TestCase):
    """Test for Importer."""

    def create_importer_level(self, filepath, level, parent_ucode_field):
        """Create importer level function."""
        with open(filepath, 'rb') as _file:
            ReferenceDatasetImporterLevel.objects.create(
                importer=self.importer,
                level=level,
                file=File(_file, name=os.path.basename(_file.name)),
                name_field='name',
                ucode_field='ucode',
                parent_ucode_field=parent_ucode_field
            )

    def setUp(self):
        """To setup test."""
        super(ImporterTest, self).setUp()
        self.reference_layer = ReferenceLayerF()
        self.importer = ReferenceDatasetImporter.objects.create(
            reference_layer=self.reference_layer
        )
        ReferenceDatasetLevel.objects.create(
            reference_layer=self.reference_layer,
            level=0,
            name='Level 0'
        )
        ReferenceDatasetLevel.objects.create(
            reference_layer=self.reference_layer,
            level=1,
            name='Level 1'
        )
        ReferenceDatasetLevel.objects.create(
            reference_layer=self.reference_layer,
            level=2,
            name='Level 2'
        )

        # Create importer level
        self.create_importer_level(
            filepath=ABS_PATH(
                'geosight', 'reference_dataset', 'tests',
                'fixtures', 'adm0.zip'
            ),
            level=0,
            parent_ucode_field=None
        )
        self.create_importer_level(
            filepath=ABS_PATH(
                'geosight', 'reference_dataset', 'tests',
                'fixtures', 'adm1.zip'
            ),
            level=1,
            parent_ucode_field='adm0_ucode'
        )
        self.create_importer_level(
            filepath=ABS_PATH(
                'geosight', 'reference_dataset', 'tests',
                'fixtures', 'adm2.zip'
            ),
            level=2,
            parent_ucode_field='adm1_ucode'
        )

    def test_importer(self):
        """Test importer."""
        ReferenceDatasetImporterTask(self.importer).run()
        self.importer.refresh_from_db()
        self.assertEqual(self.importer.status, LogStatus.SUCCESS)

        # Check saved entities
        self.reference_layer.refresh_from_db()
        self.assertEqual(self.reference_layer.entities_set.count(), 93)
        self.assertEqual(self.reference_layer.countries.count(), 1)
        self.assertEqual(
            self.reference_layer.countries.first().geom_id, 'SOM_V2'
        )
        self.assertEqual(
            self.reference_layer.countries.first().name, 'Somalia'
        )
        self.assertEqual(
            self.reference_layer.entities_set.filter(
                country__isnull=True
            ).count(), 1
        )
        self.assertEqual(
            self.reference_layer.entities_set.filter(
                country__geom_id='SOM_V2'
            ).count(), 92
        )
