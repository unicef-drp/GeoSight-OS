# coding=utf-8
"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""
__author__ = 'andrewleblanc187@gmail.com'
__date__ = '22/10/2026'
__copyright__ = ('Copyright 2023, Unicef')

from django.core.exceptions import ValidationError
from django.test import TestCase

from geosight.h3grid.models import H3ReferenceLayer, H3ReferenceLayerConfig
from geosight.reference_dataset.models.reference_dataset import (
    ReferenceDataset
)


class H3ReferenceLayerTest(TestCase):
    """Tests for H3ReferenceLayer and its managers."""

    def setUp(self):
        """Create one H3 layer and one local dataset."""
        self.h3_layer = H3ReferenceLayer.objects.create(
            identifier='h3-test', name='H3 layer'
        )
        self.local_dataset = ReferenceDataset.objects.create(
            identifier='local-test', name='Local dataset', in_georepo=False
        )

    def test_save_sets_flags(self):
        """Saving an H3 layer forces is_h3 and in_georepo=False."""
        self.h3_layer.refresh_from_db()
        self.assertTrue(self.h3_layer.is_h3)
        self.assertFalse(self.h3_layer.in_georepo)

    def test_save_overrides_wrong_flags(self):
        """Flags are forced even if the caller passes the wrong ones."""
        layer = H3ReferenceLayer.objects.create(
            identifier='h3-wrong', name='Wrong', is_h3=False, in_georepo=True
        )
        layer.refresh_from_db()
        self.assertTrue(layer.is_h3)
        self.assertFalse(layer.in_georepo)

    def test_h3_layer_only_in_h3_manager(self):
        """H3 layer is listed by H3ReferenceLayer, not ReferenceDataset."""
        self.assertIn(self.h3_layer, H3ReferenceLayer.objects.all())
        self.assertNotIn(
            self.h3_layer.pk,
            ReferenceDataset.objects.values_list('pk', flat=True)
        )

    def test_local_dataset_still_listed(self):
        """Existing local datasets still appear in ReferenceDataset."""
        self.assertIn(self.local_dataset, ReferenceDataset.objects.all())
        self.assertNotIn(
            self.local_dataset.pk,
            H3ReferenceLayer.objects.values_list('pk', flat=True)
        )


class H3ReferenceLayerConfigTest(TestCase):
    """Tests for H3ReferenceLayerConfig validation."""

    def setUp(self):
        """Create an H3 layer to attach configs to."""
        self.layer = H3ReferenceLayer.objects.create(
            identifier='h3-config-test', name='H3 config layer'
        )

    def make_config(self, min_res, default_res, max_res):
        """Build an unsaved config with the given resolutions."""
        return H3ReferenceLayerConfig(
            reference_layer=self.layer,
            min_resolution=min_res,
            default_resolution=default_res,
            max_resolution=max_res
        )

    def test_valid_config(self):
        """A config with min <= default <= max passes validation."""
        self.make_config(4, 7, 9).full_clean()

    def test_rejects_default_below_min(self):
        """min=8, default=7, max=9 is rejected."""
        with self.assertRaises(ValidationError):
            self.make_config(8, 7, 9).full_clean()

    def test_rejects_out_of_range(self):
        """Resolutions outside 0-15 are rejected."""
        for values in [(0, 7, 16), (-1, 7, 9), (0, 16, 16)]:
            with self.subTest(values=values):
                with self.assertRaises(ValidationError):
                    self.make_config(*values).full_clean()
