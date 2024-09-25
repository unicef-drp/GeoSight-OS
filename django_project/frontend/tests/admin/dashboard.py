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
from django.urls import reverse

from frontend.tests.admin._base import BaseViewTest
from geosight.data.models.dashboard import Dashboard
from geosight.data.tests.model_factories import (
    BasemapLayerF, ContextLayerF, IndicatorF
)
from geosight.georepo.models.reference_layer import ReferenceLayerView
from geosight.permission.models.factory import PERMISSIONS

User = get_user_model()


class DashboardAdminViewTest(BaseViewTest.TestCase):
    """Test for Dashboard Admin."""

    list_url_tag = 'admin-dashboard-list-view'
    create_url_tag = 'admin-dashboard-create-view'
    edit_url_tag = 'admin-dashboard-edit-view'

    # payload
    data = {
        "reference_layer": "AAAA",
        "indicator_layers": [],
        "indicator_layers_structure": {},
        "indicators": [],
        "basemaps_layers": [],
        "basemaps_layers_structure": {},
        "context_layers": [],
        "context_layers_structure": {},
        "extent": [
            0,
            0,
            0,
            0
        ],
        "widgets": [],
        "widgets_structure": {},
        "filters": {},
        "permission": {
            "organization_permission": "None",
            "public_permission": "None",
            "user_permissions": [],
            "group_permissions": [],
        }
    }

    def setUp(self):
        """To setup test."""
        ReferenceLayerView.objects.get_or_create(
            identifier="AAAA",
            name="AAAA"
        )
        super().setUp()

    @property
    def payload(self):
        """Return payload."""
        return {
            'name': 'name',
            'data': json.dumps(self.data)
        }

    def create_resource(self, user):
        """Create resource function."""
        return Dashboard.permissions.create(
            user=user,
            name='name'
        )

    def get_resources(self, user):
        """Create resource function."""
        return Dashboard.permissions.list(user).order_by('id')

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
        self.assertRequestPostView(url, 302, new_payload)
        self.assertRequestPostView(url, 403, new_payload, self.viewer)
        self.assertRequestPostView(url, 403, new_payload, self.contributor)

        self.assertRequestPostView(url, 302, new_payload, self.creator)
        new_resource = self.get_resources(self.creator).last()
        self.assertEqual(new_resource.name, new_payload['name'])
        self.assertEqual(new_resource.creator, self.creator)

        # Check the edit permission
        url = reverse(self.edit_url_tag, kwargs={'slug': new_resource.slug})
        self.assertRequestGetView(url, 302)  # Non login
        self.assertRequestGetView(url, 403, self.viewer)  # Viewer
        self.assertRequestGetView(url, 403, self.contributor)  # Contributor
        self.assertRequestGetView(url, 200, self.creator)  # Creator
        self.assertRequestGetView(url, 403, self.resource_creator)  # Creator
        self.assertRequestGetView(url, 200, self.admin)  # Admin

    def test_edit_view(self):
        """Test for edit view."""
        url = reverse(self.edit_url_tag, kwargs={'slug': 'test'})
        self.assertRequestGetView(url, 302)  # Not login

        url = reverse(self.edit_url_tag, kwargs={'slug': self.resource.slug})
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
        last_version = self.resource.version
        new_payload = copy.deepcopy(self.payload)
        new_payload['name'] = 'name 1'
        self.assertRequestPostView(url, 302, new_payload)
        self.assertRequestPostView(url, 403, new_payload, self.viewer)
        self.assertRequestPostView(url, 403, new_payload, self.contributor)

        self.assertRequestPostView(url, 302, new_payload, self.creator)
        self.resource.refresh_from_db()
        self.assertEqual(self.resource.name, new_payload['name'])
        self.assertEqual(self.resource.creator, self.resource_creator)
        self.assertNotEqual(self.resource.version, last_version)

    def test_detail_view(self):
        """Test for create view."""
        url = reverse(
            'dashboard-detail-view', kwargs={'slug': self.resource.slug})
        self.assertRequestGetView(url, 302)  # Non login
        self.assertRequestGetView(url, 403, self.viewer)  # Viewer
        self.assertRequestGetView(url, 403, self.contributor)  # Contributor
        self.assertRequestGetView(url, 403, self.creator)  # Creator
        self.assertRequestGetView(url, 200, self.admin)  # Admin

        self.permission.organization_permission = PERMISSIONS.READ.name
        self.permission.save()
        self.assertRequestGetView(url, 302)  # Non login
        self.assertRequestGetView(url, 200, self.viewer)  # Viewer
        self.assertRequestGetView(url, 200, self.contributor)  # Contributor
        self.assertRequestGetView(url, 200, self.creator)  # Creator
        self.assertRequestGetView(url, 200, self.admin)  # Admin

        self.permission.public_permission = PERMISSIONS.READ.name
        self.permission.save()
        self.assertRequestGetView(url, 200)  # Non login
        self.assertRequestGetView(url, 200, self.viewer)  # Viewer
        self.assertRequestGetView(url, 200, self.contributor)  # Contributor
        self.assertRequestGetView(url, 200, self.creator)  # Creator
        self.assertRequestGetView(url, 200, self.admin)  # Admin

    def test_versioning(self):
        """Test for create view."""
        from geosight.data.models.dashboard.dashboard_relation import (
            DashboardBasemap, DashboardContextLayer, DashboardIndicator
        )
        last_version = self.resource.version
        basemap = BasemapLayerF()
        basemap.name = 'test'
        basemap.save()

        context_layer = ContextLayerF()
        context_layer.name = 'test'
        context_layer.save()

        indicator = IndicatorF()
        indicator.name = 'test'
        indicator.save()
        self.assertEqual(self.resource.version, last_version)

        DashboardBasemap.objects.create(
            object=basemap,
            dashboard=self.resource
        )
        DashboardContextLayer.objects.create(
            object=context_layer,
            dashboard=self.resource
        )
        DashboardIndicator.objects.create(
            object=indicator,
            dashboard=self.resource
        )
        self.assertEqual(self.resource.version, last_version)

        # Update the basemap
        basemap.name = 'test'
        basemap.save()
        self.resource.refresh_from_db()
        self.assertNotEqual(self.resource.version, last_version)
        last_version = self.resource.version
        self.assertEqual(self.resource.version, last_version)

        # Update the context layer
        context_layer.name = 'test'
        context_layer.save()
        self.resource.refresh_from_db()
        self.assertNotEqual(self.resource.version, last_version)
        last_version = self.resource.version
        self.assertEqual(self.resource.version, last_version)

        # Update indicator
        indicator.name = 'test'
        indicator.save()
        self.resource.refresh_from_db()
        self.assertNotEqual(self.resource.version, last_version)
        last_version = self.resource.version
        self.assertEqual(self.resource.version, last_version)
