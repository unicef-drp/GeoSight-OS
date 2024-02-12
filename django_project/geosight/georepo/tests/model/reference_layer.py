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

from django.test.testcases import TestCase

from geosight.georepo.models.reference_layer import (
    ReferenceLayerView, ReferenceLayerViewLevel
)
from geosight.georepo.tests.model_factories.reference_layer import (
    ReferenceLayerF
)


class ReferenceLayerViewTest(TestCase):
    """Test for ReferenceLayerView model."""

    def setUp(self):
        """To setup test."""
        self.ref_1 = ReferenceLayerF()
        self.ref_2 = ReferenceLayerF(in_georepo=False)
        ReferenceLayerViewLevel.objects.create(
            reference_layer=self.ref_2, name='Level 0', level=0
        )
        ReferenceLayerViewLevel.objects.create(
            reference_layer=self.ref_2, name='Level 1', level=1
        )
        ReferenceLayerViewLevel.objects.create(
            reference_layer=self.ref_2, name='Level 2', level=2
        )

    def test_check_local(self):
        """Test check local."""
        self.assertEqual(ReferenceLayerView.objects.all().count(), 2)
        self.assertEqual(ReferenceLayerView.locals.all().count(), 1)
        self.assertEqual(self.ref_1.levels.count(), 0)
        self.assertEqual(self.ref_2.levels.count(), 3)
