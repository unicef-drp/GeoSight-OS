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
from django.test.testcases import TestCase
from django.urls import reverse

from frontend.tests.admin._base import BaseViewTest
from frontend.views.admin.harvesters import (
    HarvestedUsingExposedAPIByExternalClientView
)
from geosight.georepo.models import ReferenceLayer
from geosight.harvester.models import Harvester, UsingExposedAPI
from geosight.permission.models.factory import PERMISSIONS

User = get_user_model()
HarvesterUsed = HarvestedUsingExposedAPIByExternalClientView


class HarvesterAdminViewTest(BaseViewTest, TestCase):
    """Test for Harvester Admin."""

    list_url_tag = 'admin-harvester-list-view'
    create_url_tag = HarvesterUsed().url_create_name
    edit_url_tag = HarvesterUsed().url_edit_name

    @property
    def payload(self):
        """Return payload for push data."""
        reference_layer, created = ReferenceLayer.objects.get_or_create(
            identifier='identifier'
        )
        return {
            'harvester': UsingExposedAPI[0],
            'reference_layer': reference_layer.id,
            'admin_level': 1
        }

    def create_resource(self, user):
        """Create resource function."""
        reference_layer, created = ReferenceLayer.objects.get_or_create(
            identifier='identifier'
        )
        return Harvester.permissions.create(
            user=user,
            harvester_class=UsingExposedAPI[0],
            reference_layer=reference_layer,
        )

    def get_resources(self, user):
        """Create resource function."""
        return Harvester.permissions.list(user).order_by('id')

    def test_list_view(self):
        """Test for list view."""
        url = reverse(self.list_url_tag)
        self.assertRequestGetView(url, 302)  # Non login
        self.assertRequestGetView(url, 403, self.viewer)  # Viewer
        self.assertRequestGetView(url, 403, self.contributor)  # Contributor
        self.assertRequestGetView(url, 200, self.creator)  # Creator
        self.assertRequestGetView(url, 200, self.admin)  # Admin

    def test_create_view(self):
        """Test for create view."""
        url = reverse(self.create_url_tag)
        self.assertRequestGetView(url, 302)  # Non login
        self.assertRequestGetView(url, 403, self.viewer)  # Viewer
        self.assertRequestGetView(url, 403, self.contributor)  # Contributor
        self.assertRequestGetView(url, 200, self.creator)  # Creator
        self.assertRequestGetView(url, 200, self.admin)  # Admin

        # POST it
        self.assertRequestPostView(url, 302, self.payload)
        self.assertRequestPostView(url, 403, self.payload, self.viewer)
        self.assertRequestPostView(url, 403, self.payload, self.contributor)

        self.assertRequestPostView(url, 302, self.payload, self.creator)
        new_resource = self.get_resources(self.creator).last()
        self.assertEqual(
            new_resource.harvester_class, self.payload['harvester'])
        self.assertEqual(new_resource.creator, self.creator)

        # Check the edit permission
        url = reverse(
            self.edit_url_tag, kwargs={'uuid': new_resource.unique_id})
        self.assertRequestGetView(url, 302)  # Non login
        self.assertRequestGetView(url, 403, self.viewer)  # Viewer
        self.assertRequestGetView(url, 403, self.contributor)  # Contributor
        self.assertRequestGetView(url, 200, self.creator)  # Creator
        self.assertRequestGetView(url, 403, self.resource_creator)  # Creator
        self.assertRequestGetView(url, 200, self.admin)  # Admin

    def test_edit_view(self):
        """Test for edit view."""
        url = reverse(self.edit_url_tag,
                      kwargs={'uuid': self.resource.unique_id})
        self.assertRequestGetView(url, 302)  # Non login
        self.assertRequestGetView(url, 403, self.viewer)  # Viewer
        self.assertRequestGetView(url, 403, self.contributor)  # Contributor
        self.assertRequestGetView(url, 403, self.creator)  # Creator
        self.assertRequestGetView(url, 200, self.resource_creator)  # Creator
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
        self.assertRequestGetView(url, 200, self.creator)  # Creator

        self.permission.update_group_permission(
            self.group, PERMISSIONS.READ.name)
        self.assertRequestGetView(url, 403, self.viewer_in_group)
        self.assertRequestGetView(url, 403, self.contributor_in_group)
        self.assertRequestGetView(url, 403, self.creator_in_group)

        self.permission.update_group_permission(
            self.group, PERMISSIONS.WRITE.name)
        self.assertRequestGetView(url, 403, self.viewer_in_group)
        self.assertRequestGetView(url, 403, self.contributor_in_group)
        self.assertRequestGetView(url, 200, self.creator_in_group)

        # POST it
        new_payload = copy.deepcopy(self.payload)
        new_payload['admin_level'] = 2
        self.assertRequestPostView(url, 302, new_payload)
        self.assertRequestPostView(url, 403, new_payload, self.viewer)
        self.assertRequestPostView(url, 403, new_payload, self.contributor)
        self.assertRequestPostView(url, 302, new_payload, self.creator)
        self.resource.refresh_from_db()
        self.assertEqual(self.resource.admin_level, new_payload['admin_level'])
        self.assertEqual(self.resource.creator, self.resource_creator)
