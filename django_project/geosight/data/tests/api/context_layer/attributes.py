# coding=utf-8
"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""
__author__ = 'Irwan Fathurrahman'
__date__ = '30/03/2026'
__copyright__ = ('Copyright 2026, Unicef')

import copy

from cloud_native_gis.models.layer import Layer
from django.contrib.auth import get_user_model
from django.urls import reverse

from geosight.data.models.context_layer import ContextLayer, LayerType
from geosight.data.models.related_table import RelatedTable
from geosight.permission.tests._base import BasePermissionTest

User = get_user_model()

LIST_KEY = 'context_layers_attributes-list'


class ContextLayerAttributesViewSetTest(BasePermissionTest.TestCase):
    """Tests for ContextLayerAttributesViewSet."""

    payload = {
        'name': 'Test Context Layer',
        'layer_type': LayerType.CLOUD_NATIVE_GIS_LAYER,
    }

    def create_resource(self, user):
        """Create resource function."""
        payload = copy.deepcopy(self.payload)
        return ContextLayer.permissions.create(
            user=user,
            cloud_native_gis_layer_id=Layer.objects.create(
                created_by=user
            ).pk,
            **payload
        )

    def setUp(self):
        """Set up test fixtures."""
        super().setUp()

        # Cloud-native context layer (resource created by create_resource)
        self.cloud_native_layer = Layer.objects.create(
            created_by=self.admin
        )
        self.cloud_native_context_layer = ContextLayer.permissions.create(
            user=self.admin,
            name='Cloud Native Layer',
            layer_type=LayerType.CLOUD_NATIVE_GIS_LAYER,
            cloud_native_gis_layer_id=self.cloud_native_layer.pk,
        )

        # Related Table context layer
        self.related_table = RelatedTable.permissions.create(
            user=self.admin,
            name='Test Related Table',
        )
        self.related_table.add_field('field_one', 'Field One', 'string')
        self.related_table.add_field('field_two', 'Field Two', 'number')
        self.related_table.add_field('field_three', 'Field Three', 'date')

        self.related_table_context_layer = ContextLayer.permissions.create(
            user=self.admin,
            name='Related Table Layer',
            layer_type=LayerType.RELATED_TABLE,
            related_table=self.related_table,
        )

        # Unsupported layer type (GEOJSON)
        self.geojson_context_layer = ContextLayer.permissions.create(
            user=self.admin,
            name='GeoJSON Layer',
            layer_type=LayerType.GEOJSON,
        )

    # ------------------------------------------------------------------
    # Permission tests
    # ------------------------------------------------------------------

    def test_attributes_requires_authentication(self):
        """Unauthenticated request returns 403."""
        url = reverse(
            LIST_KEY,
            kwargs={'context_layer_id': self.cloud_native_context_layer.id}
        )
        self.assertRequestGetView(url, code=403)

    def test_attributes_viewer_forbidden(self):
        """Viewer without read-data permission gets 403."""
        self.assertRequestGetView(
            url=reverse(
                LIST_KEY,
                kwargs={
                    'context_layer_id': self.cloud_native_context_layer.id
                }
            ),
            code=403,
            user=self.viewer,
        )

    def test_attributes_admin_can_access(self):
        """Admin can access the attributes endpoint."""
        self.assertRequestGetView(
            url=reverse(
                LIST_KEY,
                kwargs={
                    'context_layer_id': self.cloud_native_context_layer.id
                }
            ),
            code=200,
            user=self.admin,
        )

    # ------------------------------------------------------------------
    # Layer-type specific tests
    # ------------------------------------------------------------------

    def test_attributes_cloud_native_layer_empty(self):
        """Cloud native layer with no attributes returns count 0."""
        response = self.assertRequestGetView(
            url=reverse(
                LIST_KEY,
                kwargs={
                    'context_layer_id': self.cloud_native_context_layer.id
                }
            ),
            code=200,
            user=self.admin,
        )
        data = response.json()
        self.assertIn('count', data)
        self.assertIn('results', data)
        self.assertEqual(data['count'], 0)

    def test_attributes_related_table_returns_fields(self):
        """Related table context layer returns its field definitions."""
        response = self.assertRequestGetView(
            url=reverse(
                LIST_KEY,
                kwargs={
                    'context_layer_id': self.related_table_context_layer.id
                }
            ),
            code=200,
            user=self.admin,
        )
        data = response.json()
        self.assertIn('count', data)
        self.assertEqual(data['count'], 3)

        # Verify serialized field structure
        result = data['results'][0]
        self.assertIn('attribute_name', result)
        self.assertIn('attribute_type', result)
        self.assertIn('attribute_label', result)
        self.assertIn('attribute_description', result)
        self.assertIn('attribute_order', result)

    def test_attributes_related_table_field_values(self):
        """Related table attributes are serialized with correct values."""
        response = self.assertRequestGetView(
            url=reverse(
                LIST_KEY,
                kwargs={
                    'context_layer_id': self.related_table_context_layer.id
                }
            ),
            code=200,
            user=self.admin,
        )
        results = response.json()['results']
        names = [r['attribute_name'] for r in results]
        self.assertIn('field_one', names)
        self.assertIn('field_two', names)
        self.assertIn('field_three', names)

        labels = {r['attribute_name']: r['attribute_label'] for r in results}
        self.assertEqual(labels['field_one'], 'Field One')
        self.assertEqual(labels['field_two'], 'Field Two')
        self.assertEqual(labels['field_three'], 'Field Three')

        # attribute_description is always None for related table fields
        for result in results:
            self.assertIsNone(result['attribute_description'])

    def test_attributes_unsupported_layer_type_returns_400(self):
        """Non-cloud-native, non-related-table layer type returns 400."""
        self.assertRequestGetView(
            url=reverse(
                LIST_KEY,
                kwargs={'context_layer_id': self.geojson_context_layer.id}
            ),
            code=400,
            user=self.admin,
        )

    def test_attributes_nonexistent_context_layer_returns_404(self):
        """Request for a non-existent context layer id returns 404."""
        self.assertRequestGetView(
            url=reverse(
                LIST_KEY,
                kwargs={'context_layer_id': 999999}
            ),
            code=404,
            user=self.admin,
        )
