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

from geosight.data.models import BasemapLayer, DashboardIndicatorLayer
from geosight.data.models.dashboard import Dashboard, DashboardBookmark
from geosight.permission.tests._base import BasePermissionTest

User = get_user_model()


class DashboardBookmarkApiTest(BasePermissionTest, TestCase):
    """Test for dashboard bookmark api."""

    def create_resource(self, user, name='name'):
        """Create resource function."""
        self.dashboard, _ = Dashboard.permissions.get_or_create(
            user=user,
            name='Dashboard'
        )
        self.layer, _ = DashboardIndicatorLayer.objects.get_or_create(
            dashboard=self.dashboard,
            name='Layer'
        )
        return DashboardBookmark.objects.create(
            dashboard=self.dashboard,
            creator=user,
            name=name
        )

    def get_resources(self, user):
        """Create resource function."""
        return DashboardBookmark.objects.order_by('id')

    def test_list_api(self):
        """Test list API."""
        url = reverse(
            'dashboard-bookmarks', kwargs={'slug': self.dashboard.slug}
        )
        response = self.assertRequestGetView(url, 200)  # Non login
        self.assertEqual(len(response.json()), 2)

    def test_edit_api(self):
        """Test list API."""
        resource = self.create_resource(self.creator, 'name 1')
        url = reverse(
            'dashboard-bookmarks-detail',
            kwargs={'slug': self.dashboard.slug, 'pk': resource.id}
        )
        data = {
            'name': 'name AA',
            'extent': [0, 0, 0, 0],
            'filters': {},
            'indicatorShow': 0,
            'selectedIndicatorLayer': self.layer.id,
            'selectedContextLayers': [],
            'contextLayersShow': False,
            'selectedAdminLevel': 0,
            'selectedBasemap': BasemapLayer.objects.create(name='name').id,
            'is3dMode': True,
            'position': '{}',
        }
        self.assertRequestPostView(url, 403, data={
            'data': json.dumps(data),
        }, user=self.viewer)
        self.assertRequestPostView(url, 200, data={
            'data': json.dumps(data),
        }, user=self.creator)
        self.assertEqual(
            DashboardBookmark.objects.get(pk=resource.id).name, 'name AA'
        )

    def test_delete_api(self):
        """Test list API."""
        resource = self.create_resource(self.creator, 'name 1')
        url = reverse(
            'dashboard-bookmarks-detail',
            kwargs={'slug': self.dashboard.slug, 'pk': resource.id}
        )
        self.assertRequestDeleteView(url, 403)
        self.assertRequestDeleteView(url, 403, self.viewer)
        self.assertRequestDeleteView(url, 403, self.contributor)
        self.assertRequestDeleteView(url, 403, self.resource_creator)
        self.assertRequestDeleteView(url, 200, self.creator)
        self.assertEqual(DashboardBookmark.objects.count(), 1)

    def test_create_api(self):
        """Test create api."""
        self.assertEqual(DashboardBookmark.objects.count(), 1)
        data = {
            'name': 'name CCC',
            'extent': [0, 0, 0, 0],
            'filters': {},
            'indicatorShow': 0,
            'selectedIndicatorLayer': self.layer.id,
            'selectedContextLayers': [],
            'contextLayersShow': False,
            'selectedAdminLevel': 0,
            'selectedBasemap': BasemapLayer.objects.create(name='name').id,
            'is3dMode': True,
            'position': '{}',
        }
        url = reverse(
            'dashboard-bookmarks-create', kwargs={'slug': self.dashboard.slug}
        )
        self.assertRequestPostView(url, 403, data={
            'data': json.dumps(data),
        }, user=self.viewer)
        self.assertRequestPostView(url, 200, data={
            'data': json.dumps(data),
        }, user=self.admin)
        self.assertEqual(DashboardBookmark.objects.count(), 2)
