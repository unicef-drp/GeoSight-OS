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

import json

from django.contrib.auth import get_user_model
from django.test.testcases import TestCase
from django.urls import reverse

from geosight.data.models import RelatedTable
from geosight.permission.models.factory import PERMISSIONS
from geosight.permission.tests._base import BasePermissionTest

User = get_user_model()


class RelatedTableApiTest(BasePermissionTest, TestCase):
    """Test for dashboard bookmark api."""

    index = 0

    def create_resource(self, user, name=None):
        """Create resource."""
        if not name:
            name = f'name {self.index}'
            self.index += 1

        obj, _ = RelatedTable.permissions.get_or_create(
            user=user,
            name=name
        )
        return obj

    def get_resources(self, user):
        """Create resource function."""
        return RelatedTable.objects.order_by('id')

    def test_list_api(self):
        """Test list API."""
        url = reverse('related-table-list-api')
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
        self.assertRequestGetView(url, 200, self.contributor)
        response = self.assertRequestGetView(
            url, 200, self.contributor)  # Contributor
        self.assertEqual(len(response.json()), 1)

        self.permission.update_group_permission(
            self.group, PERMISSIONS.READ.name)
        self.assertRequestGetView(url, 200, self.viewer_in_group)
        response = self.assertRequestGetView(url, 200, self.viewer_in_group)
        self.assertEqual(len(response.json()), 1)

        self.assertRequestGetView(url, 200, self.creator_in_group)
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

    def test_detail_api(self):
        """Test list API."""
        resource = self.create_resource(self.creator)
        url = reverse(
            'related-table-detail-api', kwargs={'pk': resource.id}
        )
        self.assertRequestDeleteView(url, 403)
        self.assertRequestDeleteView(url, 403, self.viewer)
        self.assertRequestDeleteView(url, 403, self.contributor)
        self.assertRequestDeleteView(url, 403, self.resource_creator)

        response = self.assertRequestGetView(
            reverse('related-table-list-api'), 200, self.creator)
        self.assertEqual(len(response.json()), 1)

        self.assertRequestDeleteView(url, 200, self.creator)
        response = self.assertRequestGetView(
            reverse('related-table-list-api'), 200, self.creator)
        self.assertEqual(len(response.json()), 0)

    def test_delete_api(self):
        """Test list API."""
        resource = self.create_resource(self.creator)
        url = reverse(
            'related-table-detail-api', kwargs={'pk': resource.id}
        )
        self.assertRequestDeleteView(url, 403)
        self.assertRequestDeleteView(url, 403, self.viewer)
        self.assertRequestDeleteView(url, 403, self.contributor)
        self.assertRequestDeleteView(url, 403, self.resource_creator)

        response = self.assertRequestGetView(
            reverse('related-table-list-api'), 200, self.creator)
        self.assertEqual(len(response.json()), 1)

        resource.permission.update_user_permission(
            self.resource_creator, PERMISSIONS.SHARE.name
        )
        self.assertRequestDeleteView(url, 403, self.resource_creator)

        resource.permission.update_user_permission(
            self.resource_creator, PERMISSIONS.OWNER.name
        )
        self.assertRequestDeleteView(url, 200, self.resource_creator)
        response = self.assertRequestGetView(
            reverse('related-table-list-api'), 200, self.resource_creator)
        self.assertEqual(len(response.json()), 1)

    def test_delete_multiple_api(self):
        """Test list API."""
        resource = self.create_resource(self.creator)
        url = reverse('related-table-list-api')
        data = {'ids': json.dumps([resource.id])}

        self.assertRequestDeleteView(url, 200, data=data)
        response = self.assertRequestGetView(
            reverse('related-table-list-api'), 200)
        self.assertEqual(len(response.json()), 0)

        self.assertRequestDeleteView(url, 200, self.viewer, data=data)
        response = self.assertRequestGetView(
            reverse('related-table-list-api'), 200, self.viewer)
        self.assertEqual(len(response.json()), 0)

        self.assertRequestDeleteView(url, 200, self.contributor, data=data)
        response = self.assertRequestGetView(
            reverse('related-table-list-api'), 200, self.contributor)
        self.assertEqual(len(response.json()), 0)

        self.assertRequestDeleteView(
            url, 200, self.resource_creator, data=data)
        response = self.assertRequestGetView(
            reverse('related-table-list-api'), 200, self.resource_creator)
        self.assertEqual(len(response.json()), 1)

        resource.permission.update_user_permission(
            self.resource_creator, PERMISSIONS.SHARE.name
        )
        self.assertRequestDeleteView(
            url, 200, self.resource_creator, data=data
        )
        response = self.assertRequestGetView(
            reverse('related-table-list-api'), 200, self.resource_creator)
        self.assertEqual(len(response.json()), 2)

        resource.permission.update_user_permission(
            self.resource_creator, PERMISSIONS.OWNER.name
        )
        self.assertRequestDeleteView(
            url, 200, self.resource_creator, data=data
        )
        response = self.assertRequestGetView(
            reverse('related-table-list-api'), 200, self.resource_creator)
        self.assertEqual(len(response.json()), 1)

    def data_api_assert(self, url_tag, params=''):
        """Test list API."""
        resource = self.create_resource(self.creator)
        resource.permission.organization_permission = PERMISSIONS.NONE.name
        resource.permission.public_permission = PERMISSIONS.NONE.name
        resource.permission.save()

        url = reverse(url_tag, kwargs={'pk': resource.id}) + '?' + params

        # Check the list returned
        self.assertRequestGetView(url, 403)  # Non login
        self.assertRequestGetView(url, 403, self.viewer)  # Viewer
        self.assertRequestGetView(url, 403, self.contributor)
        self.assertRequestGetView(url, 200, self.creator)  # Creator
        self.assertRequestGetView(url, 403, self.viewer_in_group)
        self.assertRequestGetView(url, 403, self.creator_in_group)
        self.assertRequestGetView(url, 403, self.resource_creator)
        self.assertRequestGetView(url, 200, self.admin)  # Admin

        # Update permissions
        resource.permission.update_user_permission(
            self.viewer, PERMISSIONS.READ.name
        )
        self.assertRequestGetView(url, 403, self.viewer)
        resource.permission.update_user_permission(
            self.viewer, PERMISSIONS.READ_DATA.name
        )
        self.assertRequestGetView(url, 200, self.viewer)

        # Update permissions group
        resource.permission.update_group_permission(
            self.group, PERMISSIONS.READ.name)
        self.assertRequestGetView(url, 403, self.viewer_in_group)
        resource.permission.update_group_permission(
            self.group, PERMISSIONS.READ_DATA.name)
        self.assertRequestGetView(url, 200, self.viewer_in_group)

        resource.permission.public_permission = PERMISSIONS.READ_DATA.name
        resource.permission.save()
        self.assertRequestGetView(url, 200, self.viewer)  # Viewer

    def test_data_api(self):
        """Test data access."""
        self.data_api_assert('related-table-data-api')

    def test_data_dates_api(self):
        """Test data access."""
        param = (
            'reference_layer_uuid=test&'
            'geography_code_field_name=test&'
            'geography_code_type=test&'
            'date_field=test'
        )
        self.data_api_assert('related-table-dates-api', param)

    def test_data_field_api(self):
        """Test data access."""
        param = 'field=test'
        self.data_api_assert('related-table-field-data-api', param)

    def test_data_values_api(self):
        """Test data access."""
        param = (
            'reference_layer_uuid=test&'
            'geography_code_field_name=test&'
            'geography_code_type=test&'
            'date_field=test'
        )
        self.data_api_assert('related-table-values-api', param)
