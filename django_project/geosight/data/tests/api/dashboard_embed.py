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

from django.contrib.auth import get_user_model
from django.urls import reverse

from geosight.data.models import BasemapLayer, DashboardIndicatorLayer
from geosight.data.models.dashboard import Dashboard, DashboardEmbed
from geosight.permission.tests._base import BasePermissionTest

User = get_user_model()


class DashboardBookmarkApiTest(BasePermissionTest.TestCase):
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

    def get_resources(self, user):
        """Create resource function."""
        return None

    def test_embed_api(self):
        """Test create api."""
        data = {
            'name': 'name CCC',
            'extent': [0, 0, 0, 0],
            'filters': {},
            'selected_indicator_layers': [self.layer.id],
            'selected_context_layers': [],
            'indicator_layer_show': False,
            'context_layer_show': False,
            'selected_admin_level': 0,
            'selected_basemap': BasemapLayer.objects.create(name='name').id,
            'is_3d_mode': True,
            'position': {},
            "transparency_config": {}
        }
        url = reverse(
            'dashboard-embed', kwargs={'slug': self.dashboard.slug}
        )
        response = self.assertRequestPostView(
            url, 200, data=data, user=self.viewer,
            content_type='application/json'
        )
        self.assertEqual(DashboardEmbed.objects.count(), 1)
        self.assertTrue('code' in response.json())
