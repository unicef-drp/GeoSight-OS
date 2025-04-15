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
__date__ = '15/04/2025'
__copyright__ = ('Copyright 2023, Unicef')

from core.tests.base_tests import APITestCase
from geosight.georepo.models.entity import Entity
from geosight.georepo.models.reference_layer import ReferenceLayerView
from geosight.georepo.request.data import GeorepoEntity
from geosight.georepo.tests.model_factories.reference_layer import (
    ReferenceLayerF
)


class ReferenceLayerViewTest(APITestCase):
    """ReferenceLayerView test."""

    def setUp(self):
        """To setup test."""
        reference_layer = ReferenceLayerF(
            name='Reference A (All version)',
            tags=['all_version']
        )
        GeorepoEntity(
            {
                'name': 'name',
                'ucode': 'A',
                'admin_level': 0
            }
        ).get_or_create(reference_layer)

        reference_layer = ReferenceLayerF(
            name='Reference A (latest)',
            tags=['latest']
        )
        GeorepoEntity(
            {
                'name': 'name',
                'ucode': 'A',
                'admin_level': 0
            }
        ).get_or_create(reference_layer)

        reference_layer = ReferenceLayerF(
            name='Reference B (All version)',
            tags=['all_version']
        )
        GeorepoEntity(
            {
                'name': 'name',
                'ucode': 'B',
                'admin_level': 0
            }
        ).get_or_create(reference_layer)

        Entity.objects.get_or_create(
            geom_id='O',
            admin_level=0
        )

    def test_priority_view(self):
        """Get priority view."""
        self.assertEqual(
            ReferenceLayerView.get_priority_view_by_country(
                Entity.objects.get(geom_id='A')
            ).name,
            'Reference A (latest)'
        )
        self.assertEqual(
            ReferenceLayerView.get_priority_view_by_country(
                Entity.objects.get(geom_id='B')
            ).name,
            'Reference B (All version)'
        )
        self.assertIsNone(
            ReferenceLayerView.get_priority_view_by_country(
                Entity.objects.get(geom_id='O')
            )
        )
