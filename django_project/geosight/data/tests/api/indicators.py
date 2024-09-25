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

from geosight.data.models.indicator import Indicator, IndicatorGroup
from geosight.permission.models.factory import PERMISSIONS
from geosight.permission.tests._base import BasePermissionTest

User = get_user_model()


class IndicatorListApiTest(BasePermissionTest.TestCase):
    """Test for context list api."""

    payload = {
        'name': 'name',
        'group': 'group'
    }

    def create_resource(self, user):
        """Create resource function."""
        payload = copy.deepcopy(self.payload)
        group = IndicatorGroup.objects.create(name=payload['group'])
        del payload['group']
        return Indicator.permissions.create(
            user=user,
            group=group,
            **payload
        )

    def get_resources(self, user):
        """Create resource function."""
        return Indicator.permissions.list(user).order_by('id')

    def test_list_api(self):
        """Test list API."""
        url = reverse('indicator-list-api')
        self.permission.organization_permission = PERMISSIONS.NONE.name
        self.permission.public_permission = PERMISSIONS.NONE.name
        self.permission.save()

        # Check the list returned
        response = self.assertRequestGetView(url, 200)  # Non login
        self.assertEqual(len(response.json()), 0)

        response = self.assertRequestGetView(url, 200, self.viewer)  # Viewer
        self.assertEqual(len(response.json()), 0)

        response = self.assertRequestGetView(url, 200, self.contributor)
        self.assertEqual(len(response.json()), 0)

        response = self.assertRequestGetView(url, 200, self.creator)  # Creator
        self.assertEqual(len(response.json()), 0)

        response = self.assertRequestGetView(url, 200, self.viewer_in_group)
        self.assertEqual(len(response.json()), 0)

        response = self.assertRequestGetView(url, 200, self.creator_in_group)
        self.assertEqual(len(response.json()), 0)

        response = self.assertRequestGetView(
            url, 200, self.resource_creator)  # Creator
        self.assertEqual(len(response.json()), 1)

        response = self.assertRequestGetView(url, 200, self.admin)  # Admin
        self.assertEqual(len(response.json()), 1)

        # sharing
        self.permission.update_user_permission(
            self.contributor, PERMISSIONS.READ.name)
        response = self.assertRequestGetView(
            url, 200, self.contributor)  # Contributor
        self.assertEqual(len(response.json()), 1)

        self.permission.update_group_permission(
            self.group, PERMISSIONS.READ.name)
        response = self.assertRequestGetView(url, 200, self.viewer_in_group)
        self.assertEqual(len(response.json()), 1)
        response = self.assertRequestGetView(url, 200, self.creator_in_group)
        self.assertEqual(len(response.json()), 1)

        self.permission.public_permission = PERMISSIONS.LIST.name
        self.permission.save()

        response = self.assertRequestGetView(url, 200, self.viewer)  # Viewer
        self.assertEqual(len(response.json()), 1)

        self.permission.organization_permission = PERMISSIONS.LIST.name
        self.permission.save()

        response = self.assertRequestGetView(url, 200)  # Viewer
        self.assertEqual(len(response.json()), 1)

    def test_delete_api(self):
        """Test list API."""
        resource = self.create_resource(self.creator)
        url = reverse('indicator-detail-api', kwargs={'pk': resource.id})
        self.assertRequestDeleteView(url, 403)
        self.assertRequestDeleteView(url, 403, self.viewer)
        self.assertRequestDeleteView(url, 403, self.contributor)
        self.assertRequestDeleteView(url, 403, self.resource_creator)

        response = self.assertRequestGetView(
            reverse('indicator-list-api'), 200, self.creator)
        self.assertEqual(len(response.json()), 1)

        self.assertRequestDeleteView(url, 200, self.creator)
        response = self.assertRequestGetView(
            reverse('indicator-list-api'), 200, self.creator)
        self.assertEqual(len(response.json()), 0)
