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
        "indicator_layers_structure": {
            'children': []
        },
        "indicators": [],
        "basemaps_layers": [],
        "basemaps_layers_structure": {
            'children': []
        },
        "context_layers": [],
        "context_layers_structure": {
            'children': []
        },
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
        self.assertEqual(new_resource.modified_by, self.creator)
        self.assertEqual(
            new_resource.transparency_config,
            {'contextLayer': 100, 'indicatorLayer': 100}
        )

        # Check the edit permission
        url = reverse(self.edit_url_tag, kwargs={'slug': new_resource.slug})
        self.assertRequestGetView(url, 302)  # Non login
        self.assertRequestGetView(url, 403, self.viewer)  # Viewer
        self.assertRequestGetView(url, 403, self.contributor)  # Contributor
        self.assertRequestGetView(url, 200, self.creator)  # Creator
        self.assertRequestGetView(url, 403, self.resource_creator)  # Creator
        self.assertRequestGetView(url, 200, self.admin)  # Admin

        # Test invalid extent
        new_data = copy.deepcopy(self.data)
        new_data['extent'] = []
        new_payload = {
            'name': 'name_invalid_extent',
            'data': json.dumps(new_data)
        }
        response = self.assertRequestPostView(
            url, 400, new_payload, self.admin
        )
        self.assertEqual(
            response.content,
            (
                b'Invalid extent, it seems the extent from '
                b'GeoRepo is empty or not correct.'
            )
        )

        # Test Indicator does not exist
        new_data = copy.deepcopy(self.data)
        new_data['indicators'] = [{'id': 9999999}]
        new_payload = {
            'name': 'name_invalid_indicator',
            'data': json.dumps(new_data)
        }
        response = self.assertRequestPostView(
            url, 400, new_payload, self.admin
        )
        self.assertEqual(
            response.content,
            b'Indicator with id 9999999 does not exist'
        )

        # ------------------------------------------
        # Create using featured
        # ------------------------------------------
        url = reverse(self.create_url_tag)
        new_payload = copy.deepcopy(self.payload)
        new_payload['name'] = 'name 1'
        new_payload['featured'] = True
        self.assertRequestPostView(url, 302, new_payload)
        self.assertRequestPostView(url, 403, new_payload, self.viewer)
        self.assertRequestPostView(url, 403, new_payload, self.contributor)
        self.assertRequestPostView(url, 400, new_payload, self.creator)
        self.assertRequestPostView(url, 302, new_payload, self.admin)
        new_resource = self.get_resources(self.admin).last()
        self.assertEqual(new_resource.name, new_payload['name'])
        self.assertEqual(new_resource.creator, self.admin)
        self.assertEqual(new_resource.modified_by, self.admin)

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
        new_payload['transparency_config'] = json.dumps(
            {"contextLayer": 20, "indicatorLayer": 30}
        )
        self.assertRequestPostView(url, 302, new_payload)
        self.assertRequestPostView(url, 403, new_payload, self.viewer)
        self.assertRequestPostView(url, 403, new_payload, self.contributor)

        self.assertRequestPostView(url, 302, new_payload, self.creator)
        self.resource.refresh_from_db()
        self.assertEqual(self.resource.name, new_payload['name'])
        self.assertEqual(self.resource.creator, self.resource_creator)
        self.assertEqual(self.resource.modified_by, self.creator)
        self.assertNotEqual(self.resource.version, last_version)
        self.assertEqual(
            self.resource.transparency_config,
            {'contextLayer': 20, 'indicatorLayer': 30}
        )
        self.assertEqual(
            self.resource.featured, False
        )
        self.permission.update_user_permission(
            self.contributor, PERMISSIONS.READ.name
        )
        self.permission.update_user_permission(
            self.creator, PERMISSIONS.WRITE.name
        )
        self.permission.refresh_from_db()

        # ------------------------------------------
        # Edit using featured
        # ------------------------------------------
        self.resource.refresh_from_db()
        url = reverse(self.edit_url_tag, kwargs={'slug': self.resource.slug})
        last_version = self.resource.version_data.timestamp()
        new_payload = copy.deepcopy(self.payload)
        new_payload['name'] = 'name 1'
        new_payload['featured'] = True
        new_payload['transparency_config'] = json.dumps(
            {"contextLayer": 20, "indicatorLayer": 30}
        )
        self.assertRequestPostView(url, 302, new_payload)
        self.assertRequestPostView(url, 403, new_payload, self.viewer)
        self.assertRequestPostView(url, 403, new_payload, self.contributor)

        self.assertRequestPostView(url, 400, new_payload, self.creator)
        self.assertRequestPostView(url, 302, new_payload, self.admin)
        self.resource.refresh_from_db()
        self.assertEqual(self.resource.name, new_payload['name'])
        self.assertEqual(self.resource.creator, self.resource_creator)
        self.assertEqual(self.resource.modified_by, self.admin)
        self.assertNotEqual(self.resource.version_data.timestamp(), last_version)
        self.assertEqual(
            self.resource.transparency_config,
            {'contextLayer': 20, 'indicatorLayer': 30}
        )
        self.assertEqual(
            self.resource.featured, True
        )

        url = reverse(self.edit_url_tag, kwargs={'slug': self.resource.slug})
        new_data = copy.deepcopy(self.data)
        new_data['extent'] = []
        new_payload = {
            'name': 'name_invalid_extent',
            'data': json.dumps(new_data)
        }
        response = self.assertRequestPostView(
            url, 400, new_payload, self.admin
        )
        self.assertEqual(
            response.content,
            (
                b'Invalid extent, it seems the extent from '
                b'GeoRepo is empty or not correct.'
            )
        )

        # Test Indicator does not exist
        new_data = copy.deepcopy(self.data)
        new_data['indicators'] = [{'id': 9999999}]
        new_payload = {
            'name': 'name_invalid_indicator',
            'data': json.dumps(new_data)
        }
        response = self.assertRequestPostView(
            url, 400, new_payload, self.admin
        )
        self.assertEqual(
            response.content,
            b'Indicator with id 9999999 does not exist'
        )

    def _payload_with_permission(self, name, permission=None):
        """Return an edit/create payload with the given permission block.

        :param name: Dashboard name.
        :type name: str
        :param permission:
            Permission block to send, or None to leave it out.
        :type permission: dict or None
        :return: The payload.
        :rtype: dict
        """
        data = copy.deepcopy(self.data)
        if permission is None:
            del data['permission']
        else:
            data['permission'] = permission
        return {'name': name, 'data': json.dumps(data)}

    def _make_private(self):
        """Make the test dashboard private."""
        self.permission.public_permission = PERMISSIONS.NONE.name
        self.permission.organization_permission = PERMISSIONS.NONE.name
        self.permission.save()

    def _user_perm(self, user):
        """Return the user's direct permission on the test dashboard.

        :param user: The user.
        :type user: User
        :return: The permission name, or None if there is none.
        :rtype: str or None
        """
        perm = self.permission.user_permissions.filter(user=user).first()
        return perm.permission if perm else None

    def test_edit_permission_without_share(self):
        """Write without Share can't change the dashboard's sharing."""
        self._make_private()
        self.permission.update_user_permission(
            self.contributor, PERMISSIONS.WRITE.name
        )
        url = reverse(self.edit_url_tag, kwargs={'slug': self.resource.slug})
        payload = self._payload_with_permission(
            'name write only', {
                'public_permission': PERMISSIONS.READ.name,
                'organization_permission': PERMISSIONS.READ.name,
                'user_permissions': [
                    {
                        'id': self.contributor.id,
                        'permission': PERMISSIONS.OWNER.name
                    }
                ],
                'group_permissions': [],
            }
        )
        self.assertRequestPostView(url, 302, payload, self.contributor)

        # The rest of the edit is saved.
        self.resource.refresh_from_db()
        self.assertEqual(self.resource.name, 'name write only')
        self.assertEqual(self.resource.modified_by, self.contributor)

        # Sharing is unchanged.
        self.permission.refresh_from_db()
        self.assertEqual(
            self.permission.public_permission, PERMISSIONS.NONE.name
        )
        self.assertEqual(
            self.permission.organization_permission, PERMISSIONS.NONE.name
        )
        self.assertEqual(
            self._user_perm(self.contributor), PERMISSIONS.WRITE.name
        )
        self.assertFalse(self.permission.has_share_perm(self.contributor))

    def test_edit_permission_with_share(self):
        """Share permission lets a user change the dashboard's sharing."""
        self._make_private()
        self.permission.update_user_permission(
            self.contributor, PERMISSIONS.SHARE.name
        )
        url = reverse(self.edit_url_tag, kwargs={'slug': self.resource.slug})
        payload = self._payload_with_permission(
            'name share', {
                'public_permission': PERMISSIONS.READ.name,
                'organization_permission': PERMISSIONS.READ.name,
                'user_permissions': [
                    {
                        'id': self.contributor.id,
                        'permission': PERMISSIONS.SHARE.name
                    },
                    {
                        'id': self.viewer.id,
                        'permission': PERMISSIONS.READ.name
                    }
                ],
                'group_permissions': [],
            }
        )
        self.assertRequestPostView(url, 302, payload, self.contributor)

        self.permission.refresh_from_db()
        self.assertEqual(
            self.permission.public_permission, PERMISSIONS.READ.name
        )
        self.assertEqual(
            self.permission.organization_permission, PERMISSIONS.READ.name
        )
        self.assertEqual(
            self._user_perm(self.contributor), PERMISSIONS.SHARE.name
        )
        self.assertEqual(self._user_perm(self.viewer), PERMISSIONS.READ.name)

        # Without a permission block, sharing stays as it is.
        # The rename changed the slug, so build the url again.
        self.resource.refresh_from_db()
        url = reverse(self.edit_url_tag, kwargs={'slug': self.resource.slug})
        payload = self._payload_with_permission('name no permission')
        self.assertRequestPostView(url, 302, payload, self.contributor)
        self.resource.refresh_from_db()
        self.assertEqual(self.resource.name, 'name no permission')
        self.permission.refresh_from_db()
        self.assertEqual(
            self.permission.public_permission, PERMISSIONS.READ.name
        )
        self.assertEqual(
            self.permission.organization_permission, PERMISSIONS.READ.name
        )
        self.assertEqual(
            self._user_perm(self.contributor), PERMISSIONS.SHARE.name
        )
        self.assertEqual(self._user_perm(self.viewer), PERMISSIONS.READ.name)

    def test_create_permission(self):
        """The creator's sharing is applied when a dashboard is created."""
        url = reverse(self.create_url_tag)
        payload = self._payload_with_permission(
            'name created shared', {
                'public_permission': PERMISSIONS.READ.name,
                'organization_permission': PERMISSIONS.NONE.name,
                'user_permissions': [
                    {
                        'id': self.viewer.id,
                        'permission': PERMISSIONS.READ.name
                    }
                ],
                'group_permissions': [],
            }
        )
        self.assertRequestPostView(url, 302, payload, self.creator)
        dashboard = Dashboard.objects.get(name='name created shared')
        permission = dashboard.permission
        self.assertEqual(dashboard.creator, self.creator)
        self.assertEqual(
            permission.get_user_perm_level(self.creator),
            PERMISSIONS.OWNER.level
        )
        self.assertEqual(permission.public_permission, PERMISSIONS.READ.name)
        self.assertEqual(
            permission.organization_permission, PERMISSIONS.NONE.name
        )
        self.assertEqual(
            permission.user_permissions.get(user=self.viewer).permission,
            PERMISSIONS.READ.name
        )

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
        last_version = self.resource.version_data
        basemap = BasemapLayerF()
        basemap.name = 'test'
        basemap.save()

        context_layer = ContextLayerF()
        context_layer.name = 'test'
        context_layer.save()

        indicator = IndicatorF()
        indicator.name = 'test'
        indicator.save()
        self.assertEqual(self.resource.version_data, last_version)

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
        self.assertEqual(self.resource.version_data, last_version)

        # Update the basemap
        basemap.name = 'test'
        basemap.save()
        self.resource.refresh_from_db()
        self.assertNotEqual(self.resource.version_data, last_version)
        last_version = self.resource.version_data
        self.assertEqual(self.resource.version_data, last_version)

        # Update the context layer
        context_layer.name = 'test'
        context_layer.save()
        self.resource.refresh_from_db()
        self.assertNotEqual(self.resource.version_data, last_version)
        last_version = self.resource.version_data
        self.assertEqual(self.resource.version_data, last_version)

        # Update indicator
        indicator.name = 'test'
        indicator.save()
        self.resource.refresh_from_db()
        self.assertNotEqual(self.resource.version_data, last_version)
        self.assertEqual(self.resource.modified_by, self.resource.creator)
        last_version = self.resource.version_data
        self.assertEqual(self.resource.version_data, last_version)
