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

import copy
from cloud_native_gis.models.layer import Layer
from django.contrib.auth import get_user_model
from django.urls import reverse

from frontend.tests.admin._base import BaseViewTest
from geosight.data.models.context_layer import ContextLayer, LayerType
from geosight.data.tests import RelatedTableF

User = get_user_model()


class ContextLayerAdminViewTest(BaseViewTest.TestCaseWithBatch):
    """Test for ContextLayer Admin."""

    list_url_tag = 'admin-context-layer-list-view'
    create_url_tag = 'admin-context-layer-create-view'
    edit_url_tag = 'admin-context-layer-edit-view'
    batch_edit_url_tag = 'admin-context-layer-edit-batch-view'
    payload = {
        'name': 'name',
        'url': 'url',
        'layer_type': LayerType.ARCGIS,
        'group': 'group'
    }

    def create_resource(self, user):
        """Create resource function."""
        payload = copy.deepcopy(self.payload)
        del payload['group']
        return ContextLayer.permissions.create(
            user=user,
            **payload
        )

    def get_resources(self, user):
        """Create resource function."""
        return ContextLayer.permissions.list(user).order_by('id')

    def test_create_view_rt_with_error(self):
        """Test for create view."""
        url = reverse(self.create_url_tag)
        self.assertRequestGetView(url, 200, self.admin)  # Admin

        # POST it
        payload = {
            'name': 'name',
            'group': 'group',
            'layer_type': LayerType.RELATED_TABLE,
        }
        resource_num = self.get_resources(self.creator).count()
        self.assertRequestPostView(url, 200, payload, self.creator)
        # Not created
        self.assertEqual(
            self.get_resources(self.creator).count(), resource_num
        )

        rt = RelatedTableF()
        # POST it
        payload = {
            'name': 'name',
            'group': 'group',
            'layer_type': LayerType.RELATED_TABLE,
            'related_table': rt.pk,
        }

        resource_num = self.get_resources(self.creator).count()

        self.assertRequestPostView(url, 302, payload, self.creator)

        # Created
        self.assertEqual(
            self.get_resources(self.creator).count(), resource_num + 1
        )

        new_resource = self.get_resources(self.creator).last()
        self.assertEqual(new_resource.name, payload['name'])
        self.assertEqual(new_resource.creator, self.creator)
        self.assertEqual(new_resource.modified_by, self.creator)
        self.assertEqual(new_resource.related_table, rt)

        # Check the edit permission
        url = reverse(self.edit_url_tag, kwargs={'pk': new_resource.id})
        self.assertRequestGetView(url, 302)  # Non login
        self.assertRequestGetView(url, 403, self.viewer)  # Viewer
        self.assertRequestGetView(
            url, 403, self.contributor
        )  # Contributor
        self.assertRequestGetView(url, 200, self.creator)  # Creator
        self.assertRequestGetView(
            url, 403, self.resource_creator
        )  # Creator
        self.assertRequestGetView(url, 200, self.admin)  # Admin

        # Edit
        payload = {
            'name': 'name',
            'group': 'group',
            'layer_type': LayerType.RELATED_TABLE
        }
        self.assertRequestPostView(url, 200, payload, self.creator)

        rt = RelatedTableF()
        payload = {
            'name': 'name',
            'group': 'group',
            'layer_type': LayerType.RELATED_TABLE,
            'related_table': rt.pk,
        }
        self.assertRequestPostView(url, 302, payload, self.creator)
        new_resource = self.get_resources(self.creator).last()
        self.assertEqual(new_resource.name, payload['name'])
        self.assertEqual(new_resource.creator, self.creator)
        self.assertEqual(new_resource.modified_by, self.creator)
        self.assertEqual(new_resource.related_table, rt)

    def test_create_view_cloud_native_with_error(self):
        """Test for create view."""
        url = reverse(self.create_url_tag)
        self.assertRequestGetView(url, 200, self.admin)  # Admin

        # POST it
        payload = {
            'name': 'name',
            'group': 'group',
            'layer_type': LayerType.CLOUD_NATIVE_GIS_LAYER,
        }
        resource_num = self.get_resources(self.creator).count()
        self.assertRequestPostView(url, 200, payload, self.creator)
        # Not created
        self.assertEqual(
            self.get_resources(self.creator).count(), resource_num
        )

        layer = Layer.objects.create(created_by=self.creator)

        payload = {
            'name': 'name',
            'group': 'group',
            'layer_type': LayerType.CLOUD_NATIVE_GIS_LAYER,
            'cloud_native_gis_layer_id': layer.id
        }

        resource_num = self.get_resources(self.creator).count()

        self.assertRequestPostView(url, 302, payload, self.creator)

        # Created
        self.assertEqual(
            self.get_resources(self.creator).count(), resource_num + 1
        )

        new_resource = self.get_resources(self.creator).last()
        self.assertEqual(new_resource.name, payload['name'])
        self.assertEqual(new_resource.creator, self.creator)
        self.assertEqual(new_resource.modified_by, self.creator)
        self.assertEqual(new_resource.cloud_native_gis_layer_id, layer.id)

        # Check the edit permission
        url = reverse(self.edit_url_tag, kwargs={'pk': new_resource.id})
        self.assertRequestGetView(url, 302)  # Non login
        self.assertRequestGetView(url, 403, self.viewer)  # Viewer
        self.assertRequestGetView(
            url, 403, self.contributor
        )  # Contributor
        self.assertRequestGetView(url, 200, self.creator)  # Creator
        self.assertRequestGetView(
            url, 403, self.resource_creator
        )  # Creator
        self.assertRequestGetView(url, 200, self.admin)  # Admin

        # Edit
        payload = {
            'name': 'name',
            'group': 'group',
            'layer_type': LayerType.CLOUD_NATIVE_GIS_LAYER
        }
        self.assertRequestPostView(url, 200, payload, self.creator)

        layer = Layer.objects.create(created_by=self.creator)
        payload = {
            'name': 'name',
            'group': 'group',
            'layer_type': LayerType.CLOUD_NATIVE_GIS_LAYER,
            'cloud_native_gis_layer_id': layer.id
        }
        self.assertRequestPostView(url, 302, payload, self.creator)

        new_resource = self.get_resources(self.creator).last()
        self.assertEqual(new_resource.name, payload['name'])
        self.assertEqual(new_resource.creator, self.creator)
        self.assertEqual(new_resource.modified_by, self.creator)
        self.assertEqual(new_resource.cloud_native_gis_layer_id, layer.id)
