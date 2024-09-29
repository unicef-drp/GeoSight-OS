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

from geosight.permission.models.factory import PERMISSIONS
from geosight.permission.tests._base import BasePermissionTest

User = get_user_model()


class BaseViewTest(object):
    """Base test view."""

    class TestCase(BasePermissionTest):
        """Test for Base Admin."""

        @property
        def list_url_tag(self):
            """Url list tag."""
            raise NotImplemented

        @property
        def create_url_tag(self):
            """Url create tag."""
            raise NotImplemented

        @property
        def edit_url_tag(self):
            """Url edit tag."""
            raise NotImplemented

        @property
        def payload(self):
            """Payload."""
            raise NotImplemented

        def test_list_view(self):
            """Test for list view."""
            url = reverse(self.list_url_tag)
            self.assertRequestGetView(url, 302)  # Non login
            self.assertRequestGetView(url, 403, self.viewer)  # Viewer
            self.assertRequestGetView(url, 200, self.contributor)  # Contributor
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
            new_payload = copy.deepcopy(self.payload)
            new_payload['name'] = 'name 1'
            new_payload['shortcode'] = 'CODE 2'
            self.assertRequestPostView(url, 302, new_payload)
            self.assertRequestPostView(url, 403, new_payload, self.viewer)
            self.assertRequestPostView(url, 403, new_payload, self.contributor)

            self.assertRequestPostView(url, 302, new_payload, self.creator)
            new_resource = self.get_resources(self.creator).last()
            self.assertEqual(new_resource.name, new_payload['name'])
            self.assertEqual(new_resource.creator, self.creator)

            # Check the edit permission
            url = reverse(self.edit_url_tag, kwargs={'pk': new_resource.id})
            self.assertRequestGetView(url, 302)  # Non login
            self.assertRequestGetView(url, 403, self.viewer)  # Viewer
            self.assertRequestGetView(url, 403, self.contributor)  # Contributor
            self.assertRequestGetView(url, 200, self.creator)  # Creator
            self.assertRequestGetView(url, 403, self.resource_creator)  # Creator
            self.assertRequestGetView(url, 200, self.admin)  # Admin

        def test_edit_view(self):
            """Test for edit view."""
            url = reverse(self.edit_url_tag, kwargs={'pk': 999})
            self.assertRequestGetView(url, 302)  # Resource not found

            url = reverse(self.edit_url_tag, kwargs={'pk': self.resource.id})
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
            self.assertRequestGetView(url, 200, self.contributor_in_group)
            self.assertRequestGetView(url, 200, self.creator_in_group)

            # POST it
            new_payload = copy.deepcopy(self.payload)
            new_payload['name'] = 'name 1'
            self.assertRequestPostView(url, 302, new_payload)
            self.assertRequestPostView(url, 403, new_payload, self.viewer)
            self.assertRequestPostView(url, 403, new_payload, self.contributor)

            self.assertRequestPostView(url, 302, new_payload, self.creator)
            self.resource.refresh_from_db()
            self.assertEqual(self.resource.name, new_payload['name'])
            self.assertEqual(self.resource.creator, self.resource_creator)
