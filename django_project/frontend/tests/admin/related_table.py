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
import json

from django.contrib.auth import get_user_model
from django.test.testcases import TestCase
from django.urls import reverse

from frontend.tests.admin._base import BaseViewTest
from geosight.data.models.related_table import RelatedTable
from geosight.permission.models.factory import PERMISSIONS

User = get_user_model()


class RelatedTableAdminViewTest(BaseViewTest, TestCase):
    """Test for RelatedTable Admin."""

    list_url_tag = 'admin-related-table-list-view'
    create_url_tag = 'admin-related-table-create-view'
    edit_url_tag = 'admin-related-table-edit-view'
    data_view_url_tag = 'admin-related-table-data-view'

    payload = {
        'name': 'name',
        'description': 'description',
        'data_fields': json.dumps([
            {
                'name': 'field_1',
                'alias': 'Field 1',
                'type': 'number',
            },
            {
                'name': 'field_2',
                'alias': 'Field 2',
                'type': 'string',
            },
            {
                'alias': 'Field 3',
                'type': 'string',
            },
            {
                'name': 'field_4',
                'type': 'string',
            },
            {
                'name': 'field_5',
                'alias': 'Field 5'
            },
        ])
    }

    def create_resource(self, user):
        """Create resource function."""
        payload = copy.deepcopy(self.payload)
        del payload['data_fields']
        return RelatedTable.permissions.create(
            user=user,
            **payload
        )

    def get_resources(self, user):
        """Create resource function."""
        return RelatedTable.permissions.list(user).order_by('id')

    def test_create_view(self):
        """Test for create view."""
        pass

    def test_edit_view(self):
        """Test for edit view."""
        super().test_edit_view()
        self.resource.refresh_from_db()
        fields_definition = self.resource.fields_definition
        self.assertEqual(len(fields_definition), 2)
        self.assertEqual(fields_definition[0]['name'], 'field_1')
        self.assertEqual(fields_definition[0]['alias'], 'Field 1')
        self.assertEqual(fields_definition[0]['type'], 'number')
        self.assertEqual(fields_definition[1]['name'], 'field_2')
        self.assertEqual(fields_definition[1]['alias'], 'Field 2')
        self.assertEqual(fields_definition[1]['type'], 'string')

    def test_data_view(self):
        """Test for create view."""
        url = reverse(self.data_view_url_tag, kwargs={'pk': 999})
        self.assertRequestGetView(url, 302)  # Resource not found
        self.permission.public_permission = PERMISSIONS.NONE.name
        self.permission.organization_permission = PERMISSIONS.NONE.name
        self.permission.save()

        url = reverse(self.data_view_url_tag, kwargs={'pk': self.resource.id})
        self.assertRequestGetView(url, 302)  # Non login
        self.assertRequestGetView(url, 403, self.viewer)  # Viewer
        self.assertRequestGetView(url, 403, self.contributor)  # Contributor
        self.assertRequestGetView(url, 403, self.creator)  # Creator
        self.assertRequestGetView(url, 200, self.resource_creator)  # Creator
        self.assertRequestGetView(url, 200, self.admin)  # Admin

        self.assertRequestGetView(url, 403, self.viewer_in_group)
        self.assertRequestGetView(url, 403, self.contributor_in_group)
        self.assertRequestGetView(url, 403, self.creator_in_group)

        # Change to read data
        self.permission.update_user_permission(
            self.creator, PERMISSIONS.READ.name)
        self.assertRequestGetView(url, 403, self.creator)  # Creator
        self.permission.update_user_permission(
            self.creator, PERMISSIONS.READ_DATA.name)
        self.assertRequestGetView(url, 200, self.creator)  # Creator
        self.permission.update_user_permission(
            self.creator, PERMISSIONS.WRITE.name)
        self.assertRequestGetView(url, 200, self.creator)  # Creator
        self.permission.update_user_permission(
            self.creator, PERMISSIONS.WRITE.name)
        self.assertRequestGetView(url, 200, self.creator)  # Creator

        self.permission.update_group_permission(
            self.group, PERMISSIONS.READ.name)
        self.assertRequestGetView(url, 403, self.viewer_in_group)
        self.assertRequestGetView(url, 403, self.contributor_in_group)
        self.assertRequestGetView(url, 403, self.creator_in_group)

        self.permission.update_group_permission(
            self.group, PERMISSIONS.READ_DATA.name)
        self.assertRequestGetView(url, 403, self.viewer_in_group)
        self.assertRequestGetView(url, 200, self.contributor_in_group)
        self.assertRequestGetView(url, 200, self.creator_in_group)

        self.permission.update_group_permission(
            self.group, PERMISSIONS.WRITE.name)
        self.assertRequestGetView(url, 403, self.viewer_in_group)
        self.assertRequestGetView(url, 200, self.contributor_in_group)
        self.assertRequestGetView(url, 200, self.creator_in_group)
