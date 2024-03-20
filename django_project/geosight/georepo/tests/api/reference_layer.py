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

from geosight.georepo.models.reference_layer import ReferenceLayerView
from geosight.permission.models.factory import PERMISSIONS
from geosight.permission.tests._base import BasePermissionTest

User = get_user_model()


class ReferenceLayerViewListApiTest(BasePermissionTest, TestCase):
    """Test for ReferenceLayerView api."""

    payload = {
        'name': 'name',
        'in_georepo': False
    }

    def create_resource(self, user, payload=None):
        """Create resource function."""
        if not payload:
            payload = copy.deepcopy(self.payload)
        return ReferenceLayerView.permissions.create(
            user=user,
            **payload
        )

    def get_resources(self, user):
        """Create resource function."""
        return ReferenceLayerView.permissions.list(user).order_by('id')

    def test_list_api(self):
        """Test list API."""
        url = reverse('reference-datasets-api-list')
        self.permission.organization_permission = PERMISSIONS.NONE.name
        self.permission.public_permission = PERMISSIONS.NONE.name
        self.permission.save()
        self.create_resource(
            self.creator, {
                'name': 'name 2',
                'in_georepo': True
            }
        )

        # Check the list returned
        self.assertRequestGetView(url, 200)  # Non login
        response = self.assertRequestGetView(url, 200, self.viewer)  # Viewer
        self.assertEqual(len(response.json()['results']), 0)

        response = self.assertRequestGetView(url, 200, self.contributor)
        self.assertEqual(len(response.json()['results']), 0)

        response = self.assertRequestGetView(url, 200, self.creator)  # Creator
        self.assertEqual(len(response.json()['results']), 0)

        response = self.assertRequestGetView(url, 200, self.viewer_in_group)
        self.assertEqual(len(response.json()['results']), 0)

        response = self.assertRequestGetView(url, 200, self.creator_in_group)
        self.assertEqual(len(response.json()['results']), 0)

        response = self.assertRequestGetView(
            url, 200, self.resource_creator)  # Creator
        self.assertEqual(len(response.json()['results']), 1)

        response = self.assertRequestGetView(url, 200, self.admin)  # Admin
        self.assertEqual(len(response.json()['results']), 1)

        # sharing
        self.permission.update_user_permission(
            self.contributor, PERMISSIONS.READ.name)
        self.assertRequestGetView(url, 200, self.contributor)
        response = self.assertRequestGetView(
            url, 200, self.contributor)  # Contributor
        self.assertEqual(len(response.json()['results']), 1)

        self.permission.update_group_permission(
            self.group, PERMISSIONS.READ.name)
        self.assertRequestGetView(url, 200, self.viewer_in_group)
        response = self.assertRequestGetView(url, 200, self.viewer_in_group)
        self.assertEqual(len(response.json()['results']), 1)

        self.assertRequestGetView(url, 200, self.creator_in_group)
        response = self.assertRequestGetView(url, 200, self.creator_in_group)
        self.assertEqual(len(response.json()['results']), 1)

        self.permission.public_permission = PERMISSIONS.LIST.name
        self.permission.save()

        response = self.assertRequestGetView(url, 200, self.viewer)  # Viewer
        self.assertEqual(len(response.json()['results']), 1)

        self.permission.organization_permission = PERMISSIONS.LIST.name
        self.permission.save()

        response = self.assertRequestGetView(url, 200)  # Viewer
        self.assertEqual(len(response.json()['results']), 1)

    def test_detail_api(self):
        """Test list API."""
        self.permission.organization_permission = PERMISSIONS.NONE.name
        self.permission.public_permission = PERMISSIONS.NONE.name
        self.permission.save()
        url = reverse(
            'reference-datasets-api-detail',
            kwargs={'identifier': self.resource.identifier}
        )
        self.assertRequestGetView(url, 403)
        self.assertRequestGetView(url, 403, self.viewer)
        self.assertRequestGetView(url, 403, self.contributor)
        self.assertRequestGetView(url, 200, self.resource_creator)

        response = self.assertRequestGetView(url, 200, self.resource_creator)
        self.assertEqual(response.json()['name'], 'name')
        self.assertEqual(
            response.json()['identifier'], self.resource.identifier
        )

    def test_delete_api(self):
        """Test list API."""
        resource = self.create_resource(
            self.creator, {
                'name': 'name 3',
                'in_georepo': False
            }
        )
        url = reverse(
            'reference-datasets-api-detail',
            kwargs={'identifier': resource.identifier}
        )
        self.assertRequestDeleteView(url, 403)
        self.assertRequestDeleteView(url, 403, self.viewer)
        self.assertRequestDeleteView(url, 403, self.contributor)
        self.assertRequestDeleteView(url, 403, self.resource_creator)

        response = self.assertRequestGetView(
            reverse('reference-datasets-api-list'), 200, self.creator)
        print(response.json()['results'][0]['name'])
        self.assertEqual(len(response.json()['results']), 2)

        self.assertRequestDeleteView(url, 204, self.creator)
        response = self.assertRequestGetView(
            reverse('reference-datasets-api-list'), 200, self.creator)
        self.assertEqual(len(response.json()['results']), 1)
