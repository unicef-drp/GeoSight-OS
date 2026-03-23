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
__date__ = '23/03/2026'
__copyright__ = ('Copyright 2023, Unicef')

import copy
import json

from django.contrib.auth import get_user_model
from django.contrib.gis.geos import GEOSGeometry
from django.urls import reverse

from geosight.georepo.request.data import GeorepoEntity
from geosight.georepo.tests.model_factories.reference_layer import (
    ReferenceLayerF
)
from geosight.permission.models.factory import PERMISSIONS
from geosight.permission.tests._base import BasePermissionTest
from geosight.reference_dataset.models.reference_dataset import (
    ReferenceDataset
)

User = get_user_model()


class ReferenceDatasetOperationApiTest(BasePermissionTest.TestCase):
    """Test for ReferenceDataset operation API."""

    payload = {
        'name': 'name',
        'in_georepo': False
    }

    def create_resource(self, user, payload=None):
        """Create resource function."""
        if not payload:
            payload = copy.deepcopy(self.payload)
        reference = ReferenceDataset.permissions.create(
            user=user,
            **payload
        )
        return reference

    def get_resources(self, user):
        """Create resource function."""
        return ReferenceDataset.permissions.list(user).order_by('id')

    def setUp(self):
        """Set up test data with entities that have geometries."""
        super().setUp()

        self.reference_layer = ReferenceLayerF(in_georepo=False)

        # Entity with geometry inside bbox [0,0,10,10]
        self.entity_a, _ = GeorepoEntity(
            {
                'name': 'Entity A',
                'ucode': 'EA',
                'admin_level': 0,
                'concept_uuid': 'concept-uuid-a',
            }
        ).get_or_create(self.reference_layer)
        self.entity_a.geometry = GEOSGeometry(
            'POLYGON ((0 0, 10 0, 10 10, 0 10, 0 0))'
        )
        self.entity_a.save()

        # Entity with geometry inside bbox [20,20,30,30]
        self.entity_b, _ = GeorepoEntity(
            {
                'name': 'Entity B',
                'ucode': 'EB',
                'admin_level': 0,
                'concept_uuid': 'concept-uuid-b',
            }
        ).get_or_create(self.reference_layer)
        self.entity_b.geometry = GEOSGeometry(
            'POLYGON ((20 20, 30 20, 30 30, 20 30, 20 20))'
        )
        self.entity_b.save()

        # Entity with no geometry
        self.entity_no_geom, _ = GeorepoEntity(
            {
                'name': 'Entity No Geom',
                'ucode': 'ENG',
                'admin_level': 0,
                'concept_uuid': 'concept-uuid-no-geom',
            }
        ).get_or_create(self.reference_layer)

        # Make dataset publicly readable so all users can access it
        self.reference_layer.permission.public_permission = (
            PERMISSIONS.READ_DATA.name
        )
        self.reference_layer.permission.save()

    def _bbox_url(self, identifier=None):
        """Return bbox URL for identifier."""
        if identifier is None:
            identifier = self.reference_layer.identifier
        return reverse(
            'reference-datasets-bbox-concept-uuid-api',
            kwargs={'identifier': identifier}
        )

    def _post_json(self, url, data, user=None, code=200):
        """POST JSON data and assert status code."""
        return self.assertRequestPostView(
            url, code, json.dumps(data),
            user=user, content_type='application/json'
        )

    def test_bbox_single_entity(self):
        """Bbox of a single entity matches its geometry extent."""
        response = self._post_json(
            self._bbox_url(),
            ['concept-uuid-a'],
            user=self.admin,
        )
        bbox = response.json()
        self.assertEqual(len(bbox), 4)
        self.assertAlmostEqual(bbox[0], 0.0)
        self.assertAlmostEqual(bbox[1], 0.0)
        self.assertAlmostEqual(bbox[2], 10.0)
        self.assertAlmostEqual(bbox[3], 10.0)

    def test_bbox_multiple_entities(self):
        """Bbox of multiple entities is the union of their extents."""
        response = self._post_json(
            self._bbox_url(),
            ['concept-uuid-a', 'concept-uuid-b'],
            user=self.admin,
        )
        bbox = response.json()
        self.assertEqual(len(bbox), 4)
        self.assertAlmostEqual(bbox[0], 0.0)
        self.assertAlmostEqual(bbox[1], 0.0)
        self.assertAlmostEqual(bbox[2], 30.0)
        self.assertAlmostEqual(bbox[3], 30.0)

    def test_bbox_entity_without_geometry_is_skipped(self):
        """Entities without geometry are excluded from bbox calculation."""
        response = self._post_json(
            self._bbox_url(),
            ['concept-uuid-no-geom'],
            user=self.admin,
        )
        self.assertEqual(response.json(), [])

    def test_bbox_empty_list(self):
        """Empty concept_uuid list returns empty bbox."""
        response = self._post_json(
            self._bbox_url(), [], user=self.admin
        )
        self.assertEqual(response.json(), [])

    def test_bbox_unknown_identifier_returns_404(self):
        """Non-existent reference layer identifier returns 404."""
        self._post_json(
            self._bbox_url('non-existent-identifier'),
            ['concept-uuid-a'],
            user=self.admin,
            code=404,
        )
