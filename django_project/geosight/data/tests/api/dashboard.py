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
from django.urls import reverse

from core.models.preferences import SitePreferences
from geosight.data.models.dashboard import Dashboard
from geosight.permission.models.factory import PERMISSIONS
from geosight.permission.tests._base import BasePermissionTest

User = get_user_model()


class DashboardListApiTest(BasePermissionTest.TestCase):
    """Test for context list api."""

    def create_resource(self, user, name='name'):
        """Create resource function."""
        return Dashboard.permissions.create(
            user=user,
            name=name
        )

    def get_resources(self, user):
        """Create resource function."""
        return Dashboard.permissions.list(user).order_by('id')

    def test_list_api(self):
        """Test list API."""
        url = reverse('dashboard-list-api')
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

    def test_data_api(self):
        """Test list API."""
        resource = self.create_resource(self.creator, 'Dashboard test')
        url = reverse('dashboard-data-api', kwargs={'slug': resource.slug})
        permission = resource.permission
        permission.organization_permission = PERMISSIONS.NONE.name
        permission.public_permission = PERMISSIONS.NONE.name
        permission.save()

        # Check the list returned
        self.assertRequestGetView(url, 403)  # Non login
        self.assertRequestGetView(url, 403, self.viewer)  # Viewer
        self.assertRequestGetView(url, 403, self.contributor)
        self.assertRequestGetView(url, 200, self.creator)

        self.assertRequestGetView(url, 403, self.viewer_in_group)
        self.assertRequestGetView(url, 403, self.creator_in_group)

        self.assertRequestGetView(
            url, 403, self.resource_creator)  # Creator
        self.assertRequestGetView(url, 200, self.admin)  # Admin

        # sharing
        permission.update_user_permission(
            self.contributor, PERMISSIONS.READ.name)
        self.assertRequestGetView(url, 200, self.contributor)
        self.assertRequestGetView(url, 200, self.contributor)  # Contributor

        permission.update_group_permission(
            self.group, PERMISSIONS.READ.name)
        self.assertRequestGetView(url, 200, self.viewer_in_group)
        self.assertRequestGetView(url, 200, self.creator_in_group)

        permission.public_permission = PERMISSIONS.READ.name
        permission.save()

        self.assertRequestGetView(url, 200, self.viewer)  # Viewer

    def test_data_content_api(self):
        """Test list API."""
        resource = self.create_resource(self.creator, 'Dashboard test 1')
        url = reverse('dashboard-data-api', kwargs={'slug': resource.slug})

        # Test from site preferences default
        response = self.assertRequestGetView(url, 200, self.creator)
        data = response.json()
        self.assertEqual(data['name'], 'Dashboard test 1')
        self.assertEqual(data['slug'], resource.slug)
        pref = SitePreferences.preferences()
        self.assertEqual(data['default_time_mode'], {
            'use_only_last_known_value': True,
            'fit_to_current_indicator_range':
                pref.fit_to_current_indicator_range,
            'show_last_known_value_in_range':
                pref.show_last_known_value_in_range,
            'default_interval': pref.default_interval,
        })
        pref.fit_to_current_indicator_range = True
        pref.show_last_known_value_in_range = False
        pref.default_interval = 'Yearly'
        pref.save()

        # Test from updates site preferences
        response = self.assertRequestGetView(url, 200, self.creator)
        data = response.json()
        self.assertEqual(data['default_time_mode'], {
            'use_only_last_known_value': True,
            'fit_to_current_indicator_range':
                pref.fit_to_current_indicator_range,
            'show_last_known_value_in_range':
                pref.show_last_known_value_in_range,
            'default_interval': pref.default_interval,
        })

        # Test overriden data
        resource.default_time_mode = {
            'use_only_last_known_value': True,
            'fit_to_current_indicator_range': True,
            'show_last_known_value_in_range': True,
            'default_interval': 'Daily',
        }
        resource.save()
        response = self.assertRequestGetView(url, 200, self.creator)
        data = response.json()

        self.assertEqual(data['default_time_mode'], {
            'use_only_last_known_value': True,
            'fit_to_current_indicator_range': True,
            'show_last_known_value_in_range': True,
            'default_interval': 'Daily',
        })

    def test_delete_api(self):
        """Test list API."""
        resource = self.create_resource(self.creator, 'name 2')
        url = reverse('dashboard-detail-api', kwargs={'slug': resource.slug})
        self.assertRequestDeleteView(url, 403)
        self.assertRequestDeleteView(url, 403, self.viewer)
        self.assertRequestDeleteView(url, 403, self.contributor)
        self.assertRequestDeleteView(url, 403, self.resource_creator)

        response = self.assertRequestGetView(
            reverse('dashboard-list-api'), 200, self.creator)
        self.assertEqual(len(response.json()), 1)

        self.assertRequestDeleteView(url, 200, self.creator)
        response = self.assertRequestGetView(
            reverse('dashboard-list-api'), 200, self.creator)
        self.assertEqual(len(response.json()), 0)

    def test_delete_multiple_api(self):
        """Test list API."""
        resource = self.create_resource(self.creator, 'name 2')
        url = reverse('dashboard-list-api')
        self.assertRequestDeleteView(
            url, 200, self.viewer, data={'ids': json.dumps([resource.id])}
        )
        self.assertEqual(Dashboard.objects.count(), 2)
        self.assertRequestDeleteView(
            url, 200, self.creator, data={'ids': json.dumps([resource.slug])}
        )
        self.assertEqual(Dashboard.objects.count(), 1)
