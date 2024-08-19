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

from django.contrib.auth import get_user_model
from django.urls import reverse

from core.tests.base_tests import TenantTestCase as TestCase
from geosight.georepo.models.reference_layer import ReferenceLayerView
from geosight.permission.models.factory import PERMISSIONS
from geosight.permission.tests._base import BasePermissionTest

User = get_user_model()


class ReferenceDatasetViewTest(BasePermissionTest, TestCase):
    """Test for Base Admin."""

    list_url_tag = 'admin-reference-layer-view-list-view'
    create_url_tag = 'admin-reference-layer-view-create-view'
    edit_url_tag = 'admin-reference-layer-view-edit-view'
    payload = {
        'name': 'name',
        'description': 'description'
    }

    def create_resource(self, user):
        """Create resource function."""
        payload = copy.deepcopy(self.payload)
        return ReferenceLayerView.permissions.create(
            user=user,
            **payload
        )

    def get_resources(self, user):
        """Create resource function."""
        return ReferenceLayerView.permissions.list(user).order_by('id')

    def test_list_view(self):
        """Test for list view."""
        url = reverse(self.list_url_tag)
        self.assertRequestGetView(url, 302)  # Non login
        self.assertRequestGetView(url, 403, self.viewer)  # Viewer
        self.assertRequestGetView(url, 403, self.contributor)  # Contributor
        self.assertRequestGetView(url, 403, self.creator)  # Creator
        self.assertRequestGetView(url, 200, self.admin)  # Admin

    def test_create_view(self):
        """Test for create view."""
        url = reverse(self.create_url_tag)
        self.assertRequestGetView(url, 302)  # Non login
        self.assertRequestGetView(url, 403, self.viewer)  # Viewer
        self.assertRequestGetView(url, 403, self.contributor)  # Contributor
        self.assertRequestGetView(url, 403, self.creator)  # Creator
        self.assertRequestGetView(url, 200, self.admin)  # Admin

        # POST it
        new_payload = copy.deepcopy(self.payload)
        new_payload['name'] = 'name 1'
        new_payload['shortcode'] = 'CODE 2'
        self.assertRequestPostView(url, 302, new_payload)
        self.assertRequestPostView(url, 403, new_payload, self.viewer)
        self.assertRequestPostView(url, 403, new_payload, self.contributor)

        self.assertRequestPostView(url, 403, new_payload, self.creator)
        self.assertRequestPostView(url, 302, new_payload, self.admin)
        new_resource = self.get_resources(self.creator).last()
        self.assertEqual(new_resource.name, new_payload['name'])
        self.assertEqual(new_resource.creator, self.admin)

        # Check the edit permission
        url = reverse(
            self.edit_url_tag, kwargs={'identifier': new_resource.identifier}
        )
        self.assertRequestGetView(url, 302)  # Non login
        self.assertRequestGetView(url, 403, self.viewer)  # Viewer
        self.assertRequestGetView(url, 403, self.contributor)  # Contributor
        self.assertRequestGetView(url, 403, self.creator)  # Creator
        self.assertRequestGetView(url, 403, self.resource_creator)  # Creator
        self.assertRequestGetView(url, 200, self.admin)  # Admin

    def test_edit_view(self):
        """Test for edit view."""
        url = reverse(
            self.edit_url_tag,
            kwargs={'identifier': '00000000-0000-0000-0000-000000000000'}
        )
        self.assertRequestGetView(url, 302)  # Resource not found

        url = reverse(
            self.edit_url_tag, kwargs={'identifier': self.resource.identifier}
        )
        self.assertRequestGetView(url, 302)  # Non login
        self.assertRequestGetView(url, 403, self.viewer)  # Viewer
        self.assertRequestGetView(url, 403, self.contributor)  # Contributor
        self.assertRequestGetView(url, 403, self.creator)  # Creator
        self.assertRequestGetView(url, 403, self.resource_creator)  # Creator
        self.assertRequestGetView(url, 200, self.admin)  # Admin

        # sharing
        self.assertRequestGetView(url, 403, self.viewer_in_group)
        self.assertRequestGetView(url, 403, self.contributor_in_group)
        self.assertRequestGetView(url, 403, self.creator_in_group)

        # sharing
        self.permission.update_user_permission(
            self.creator, PERMISSIONS.READ.name)
        self.assertRequestGetView(url, 403, self.creator)  # Creator
        self.permission.update_user_permission(
            self.creator, PERMISSIONS.WRITE.name)
        self.assertRequestGetView(url, 403, self.creator)  # Creator

        self.permission.update_group_permission(
            self.group, PERMISSIONS.READ.name)
        self.assertRequestGetView(url, 403, self.viewer_in_group)
        self.assertRequestGetView(url, 403, self.contributor_in_group)
        self.assertRequestGetView(url, 403, self.creator_in_group)

        self.permission.update_group_permission(
            self.group, PERMISSIONS.WRITE.name)
        self.assertRequestGetView(url, 403, self.viewer_in_group)
        self.assertRequestGetView(url, 403, self.contributor_in_group)
        self.assertRequestGetView(url, 403, self.creator_in_group)

        # POST it
        new_payload = copy.deepcopy(self.payload)
        new_payload['name'] = 'name 1'
        self.assertRequestPostView(url, 302, new_payload)
        self.assertRequestPostView(url, 403, new_payload, self.viewer)
        self.assertRequestPostView(url, 403, new_payload, self.contributor)

        self.assertRequestPostView(url, 403, new_payload, self.creator)
        self.creator.profile.manage_local_dataset = True
        self.creator.profile.save()
        self.assertRequestPostView(url, 302, new_payload, self.creator)
        self.resource.refresh_from_db()
        self.assertEqual(self.resource.name, new_payload['name'])
        self.assertEqual(self.resource.creator, self.resource_creator)
