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

from core.models.profile import ROLES
from core.tests.base_tests import TestCase
from core.tests.model_factories import GroupF, create_user
from geosight.data.models.indicator import Indicator
from geosight.georepo.models import ReferenceLayerView
from geosight.georepo.models.reference_layer import ReferenceLayerIndicator
from geosight.permission.models import PERMISSIONS

User = get_user_model()


class DatasetPermissionTest(TestCase):
    """Test for Permission Test."""

    password = 'password'

    def create_resource(self, name, user):
        """Create resource function."""
        indicator = Indicator.permissions.create(user=user, name=name)
        reference_layer = ReferenceLayerView.objects.create(
            identifier=name, name=name
        )
        return ReferenceLayerIndicator.permissions.create(
            user=user,
            indicator=indicator,
            reference_layer=reference_layer
        )

    def get_resources(self, user):
        """Create resource function."""
        return ReferenceLayerIndicator.permissions.list(user)

    def setUp(self):
        """To setup test."""
        self.admin = create_user(ROLES.SUPER_ADMIN.name)
        self.creator = create_user(ROLES.CREATOR.name)
        self.contributor = create_user(ROLES.CONTRIBUTOR.name)
        self.viewer = create_user(ROLES.VIEWER.name)
        self.resource_creator = create_user(ROLES.CREATOR.name)

        self.group = GroupF()
        self.viewer_in_group = create_user(ROLES.VIEWER.name)
        self.viewer_in_group.groups.add(self.group)

        # Resource layer attribute
        self.resource = self.create_resource(
            'identifier 1',
            self.resource_creator
        )
        self.permission = self.resource.permission
        self.group_permission = (
            self.resource.permission.update_group_permission(
                self.group, PERMISSIONS.LIST
            )
        )
        self.user_permission = self.resource.permission.update_user_permission(
            self.viewer, PERMISSIONS.LIST
        )

    def assertRequestGetView(self, url, code, user=None):
        """Assert request GET view with code."""
        client = self.test_client()
        if user:
            client.login(username=user.username, password=self.password)
        response = client.get(url)
        self.assertEquals(response.status_code, code)
        return response

    def assertRequestPostView(
            self, url, code, data, user=None,
            content_type='application/json', follow=False
    ):
        """Assert request POST view with code."""
        client = self.test_client()
        if user:
            client.login(username=user.username, password=self.password)
        response = client.post(
            url, data=data, content_type=content_type, follow=follow
        )
        self.assertEquals(response.status_code, code)
        return response

    def assertRequestPutView(
            self, url, code, data, user=None,
            content_type='application/json', follow=False
    ):
        """Assert request POST view with code."""
        client = self.test_client()
        if user:
            client.login(username=user.username, password=self.password)
        response = client.put(
            url, data=data, content_type=content_type, follow=follow
        )
        self.assertEquals(response.status_code, code)
        return response

    def assertRequestDeleteView(
            self, url, code, data, user=None,
            content_type='application/json', follow=False
    ):
        """Assert request POST view with code."""
        client = self.test_client()
        if user:
            client.login(username=user.username, password=self.password)
        response = client.delete(
            url, data=data, content_type=content_type, follow=follow
        )
        self.assertEquals(response.status_code, code)
        return response

    def test_get_api(self):
        """Test list of resource."""
        url = reverse('data-access-general-api')

        self.assertRequestGetView(url, 302)  # Non login
        self.assertRequestGetView(url, 403, self.viewer)
        self.assertRequestGetView(url, 403, self.viewer_in_group)
        self.assertRequestGetView(url, 403, self.contributor)

        responses = self.assertRequestGetView(url, 200, self.creator)
        self.assertEqual(responses.json()['count'], 0)
        responses = self.assertRequestGetView(url, 200, self.resource_creator)
        self.assertEqual(responses.json()['count'], 1)
        responses = self.assertRequestGetView(url, 200, self.admin)
        self.assertEqual(responses.json()['count'], 1)

        url = reverse('data-access-users-api')

        self.assertRequestGetView(url, 302)  # Non login
        self.assertRequestGetView(url, 403, self.viewer)
        self.assertRequestGetView(url, 403, self.viewer_in_group)
        self.assertRequestGetView(url, 403, self.contributor)

        responses = self.assertRequestGetView(url, 200, self.creator)
        self.assertEqual(responses.json()['count'], 0)
        responses = self.assertRequestGetView(url, 200, self.resource_creator)
        self.assertEqual(responses.json()['count'], 1)
        responses = self.assertRequestGetView(url, 200, self.admin)
        self.assertEqual(responses.json()['count'], 1)

        url = reverse('data-access-groups-api')

        self.assertRequestGetView(url, 302)  # Non login
        self.assertRequestGetView(url, 403, self.viewer)
        self.assertRequestGetView(url, 403, self.viewer_in_group)
        self.assertRequestGetView(url, 403, self.contributor)
        responses = self.assertRequestGetView(url, 200, self.creator)
        self.assertEqual(responses.json()['count'], 0)
        responses = self.assertRequestGetView(url, 200, self.resource_creator)
        self.assertEqual(responses.json()['count'], 1)
        responses = self.assertRequestGetView(url, 200, self.admin)
        self.assertEqual(responses.json()['count'], 1)

    def test_post_api(self):
        """Test post api."""
        url = reverse('data-access-general-api')

        # Create resource
        indicator = Indicator.permissions.create(
            user=self.admin, name='identifier 2'
        )
        indicator.permission.update_user_permission(
            self.resource_creator, PERMISSIONS.SHARE
        )
        reference_layer = ReferenceLayerView.objects.create(
            identifier='identifier 2', name='identifier 2'
        )
        data = {
            'indicators': [indicator.id],
            'datasets': [reference_layer.identifier],
            'permission': PERMISSIONS.LIST.name,
        }
        self.assertRequestPostView(url, 302, data)  # Non login
        self.assertRequestPostView(url, 403, data, self.viewer)
        self.assertRequestPostView(url, 403, data, self.viewer_in_group)
        self.assertRequestPostView(url, 403, data, self.contributor)
        self.assertRequestPostView(url, 405, data, self.creator)
        self.assertRequestPostView(url, 405, data, self.resource_creator)
        self.assertRequestPostView(url, 405, data, self.admin)

        url = reverse('data-access-users-api')
        data['objects'] = [self.viewer_in_group.id]
        self.assertRequestPostView(url, 302, data)  # Non login
        self.assertRequestPostView(url, 403, data, self.viewer)
        self.assertRequestPostView(url, 403, data, self.viewer_in_group)
        self.assertRequestPostView(url, 403, data, self.contributor)

        # When the permission is rejected
        data['permission'] = PERMISSIONS.LIST.name
        self.assertRequestPostView(url, 400, data, self.creator)

        data['permission'] = PERMISSIONS.READ.name
        # Creator can't add any indicator
        self.assertRequestPostView(url, 400, data, self.creator)
        responses = self.assertRequestGetView(url, 200, self.creator)
        self.assertEqual(responses.json()['count'], 0)

        # Resource creator can create this as it has share permission
        responses = self.assertRequestGetView(url, 200, self.resource_creator)
        self.assertEqual(responses.json()['count'], 1)
        self.assertRequestPostView(url, 201, data, self.resource_creator)
        responses = self.assertRequestGetView(url, 200, self.resource_creator)
        self.assertEqual(responses.json()['count'], 2)

        # Admin add it, but the data still same
        self.assertRequestPostView(url, 201, data, self.admin)
        responses = self.assertRequestGetView(url, 200, self.admin)
        self.assertEqual(responses.json()['count'], 2)

        url = reverse('data-access-groups-api')
        data['objects'] = [GroupF().id]
        self.assertRequestPostView(url, 302, data)  # Non login
        self.assertRequestPostView(url, 403, data, self.viewer)
        self.assertRequestPostView(url, 403, data, self.viewer_in_group)
        self.assertRequestPostView(url, 403, data, self.contributor)

        # When the permission is rejected
        data['permission'] = PERMISSIONS.LIST.name
        self.assertRequestPostView(url, 400, data, self.creator)

        data['permission'] = PERMISSIONS.READ.name
        # Creator can't add any indicator
        self.assertRequestPostView(url, 400, data, self.creator)
        responses = self.assertRequestGetView(url, 200, self.creator)
        self.assertEqual(responses.json()['count'], 0)

        # Resource creator can create this as it has share permission
        responses = self.assertRequestGetView(url, 200, self.resource_creator)
        self.assertEqual(responses.json()['count'], 1)
        self.assertRequestPostView(url, 201, data, self.resource_creator)
        responses = self.assertRequestGetView(url, 200, self.resource_creator)
        self.assertEqual(responses.json()['count'], 2)

        # Admin add it, but the data still same
        self.assertRequestPostView(url, 201, data, self.admin)
        responses = self.assertRequestGetView(url, 200, self.admin)
        self.assertEqual(responses.json()['count'], 2)

    def test_put_api(self):
        """Test put api."""
        url = reverse('data-access-general-api')
        data = {
            'permission': PERMISSIONS.LIST.name,
            'ids': [self.permission.id]
        }

        self.assertRequestPutView(url, 302, data)  # Non login
        self.assertRequestPutView(url, 403, data, self.viewer)
        self.assertRequestPutView(url, 403, data, self.viewer_in_group)
        self.assertRequestPutView(url, 403, data, self.contributor)

        responses = self.assertRequestGetView(url, 200, self.creator)
        self.assertEqual(responses.json()['count'], 0)

        # Put by creator, but it is not updated
        self.assertRequestPutView(url, 400, data, self.creator)
        data['permission'] = PERMISSIONS.READ.name

        # Check by resource creator
        responses = self.assertRequestGetView(url, 200, self.resource_creator)
        self.assertEqual(responses.json()['count'], 1)
        self.assertEqual(
            responses.json()['results'][0]['permission'], PERMISSIONS.NONE.name
        )

        # Put by resource creator
        self.assertRequestPutView(url, 204, data, self.resource_creator)
        responses = self.assertRequestGetView(url, 200, self.resource_creator)
        self.assertEqual(responses.json()['count'], 1)
        self.assertEqual(
            responses.json()['results'][0]['permission'], PERMISSIONS.READ.name
        )

        responses = self.assertRequestGetView(url, 200, self.admin)
        self.assertEqual(responses.json()['count'], 1)
        self.assertEqual(
            responses.json()['results'][0]['permission'], PERMISSIONS.READ.name
        )

        # User data access
        url = reverse('data-access-users-api')
        data = {
            'permission': PERMISSIONS.LIST.name,
            'ids': [self.user_permission.id]
        }

        self.assertRequestPutView(url, 302, data)  # Non login
        self.assertRequestPutView(url, 403, data, self.viewer)
        self.assertRequestPutView(url, 403, data, self.viewer_in_group)
        self.assertRequestPutView(url, 403, data, self.contributor)

        responses = self.assertRequestGetView(url, 200, self.creator)
        self.assertEqual(responses.json()['count'], 0)

        # Put by creator, but it is not updated
        self.assertRequestPutView(url, 400, data, self.creator)
        data['permission'] = PERMISSIONS.READ.name

        # Check by resource creator
        responses = self.assertRequestGetView(url, 200, self.resource_creator)
        self.assertEqual(responses.json()['count'], 1)
        self.assertEqual(
            responses.json()['results'][0]['permission'], PERMISSIONS.LIST.name
        )

        # Put by resource creator
        self.assertRequestPutView(url, 204, data, self.resource_creator)
        responses = self.assertRequestGetView(url, 200, self.resource_creator)
        self.assertEqual(responses.json()['count'], 1)
        self.assertEqual(
            responses.json()['results'][0]['permission'], PERMISSIONS.READ.name
        )

        responses = self.assertRequestGetView(url, 200, self.admin)
        self.assertEqual(responses.json()['count'], 1)
        self.assertEqual(
            responses.json()['results'][0]['permission'], PERMISSIONS.READ.name
        )
        # Group data access
        url = reverse('data-access-groups-api')
        data = {
            'permission': PERMISSIONS.LIST.name,
            'ids': [self.group_permission.id]
        }

        self.assertRequestPutView(url, 302, data)  # Non login
        self.assertRequestPutView(url, 403, data, self.viewer)
        self.assertRequestPutView(url, 403, data, self.viewer_in_group)
        self.assertRequestPutView(url, 403, data, self.contributor)

        responses = self.assertRequestGetView(url, 200, self.creator)
        self.assertEqual(responses.json()['count'], 0)

        # Put by creator, but it is not updated
        self.assertRequestPutView(url, 400, data, self.creator)
        data['permission'] = PERMISSIONS.READ.name

        # Check by resource creator
        responses = self.assertRequestGetView(url, 200, self.resource_creator)
        self.assertEqual(responses.json()['count'], 1)
        self.assertEqual(
            responses.json()['results'][0]['permission'], PERMISSIONS.LIST.name
        )

        # Put by resource creator
        self.assertRequestPutView(url, 204, data, self.resource_creator)
        responses = self.assertRequestGetView(url, 200, self.resource_creator)
        self.assertEqual(responses.json()['count'], 1)
        self.assertEqual(
            responses.json()['results'][0]['permission'], PERMISSIONS.READ.name
        )

        responses = self.assertRequestGetView(url, 200, self.admin)
        self.assertEqual(responses.json()['count'], 1)
        self.assertEqual(
            responses.json()['results'][0]['permission'], PERMISSIONS.READ.name
        )

    def test_delete_api(self):
        """Test post api."""
        url = reverse('data-access-general-api')

        # Create resource
        resource = self.create_resource(
            'identifier 2', self.resource_creator
        )
        group_permission = resource.permission.update_group_permission(
            self.group, PERMISSIONS.LIST
        )
        user_permission = resource.permission.update_user_permission(
            self.viewer, PERMISSIONS.LIST
        )
        data = {
            'ids': [self.permission.id],
        }
        self.assertRequestDeleteView(url, 302, data)  # Non login
        self.assertRequestDeleteView(url, 403, data, self.viewer)
        self.assertRequestDeleteView(url, 403, data, self.viewer_in_group)
        self.assertRequestDeleteView(url, 403, data, self.contributor)
        self.assertRequestDeleteView(url, 405, data, self.creator)
        self.assertRequestDeleteView(url, 405, data, self.resource_creator)
        self.assertRequestDeleteView(url, 405, data, self.admin)

        url = reverse('data-access-users-api')
        data['ids'] = [user_permission.id]
        self.assertRequestDeleteView(url, 302, data)  # Non login
        self.assertRequestDeleteView(url, 403, data, self.viewer)
        self.assertRequestDeleteView(url, 403, data, self.viewer_in_group)
        self.assertRequestDeleteView(url, 403, data, self.contributor)

        # Creator can't add any indicator
        self.assertRequestDeleteView(url, 204, data, self.creator)
        responses = self.assertRequestGetView(url, 200, self.creator)
        self.assertEqual(responses.json()['count'], 0)

        # Resource creator can create this as it has share permission
        responses = self.assertRequestGetView(url, 200, self.resource_creator)
        self.assertEqual(responses.json()['count'], 2)
        self.assertRequestDeleteView(url, 204, data, self.resource_creator)
        responses = self.assertRequestGetView(url, 200, self.resource_creator)
        self.assertEqual(responses.json()['count'], 1)

        # Admin add it, but the data still same
        self.assertRequestDeleteView(url, 204, data, self.admin)
        responses = self.assertRequestGetView(url, 200, self.admin)
        self.assertEqual(responses.json()['count'], 1)

        url = reverse('data-access-groups-api')
        data['ids'] = [group_permission.id]
        self.assertRequestDeleteView(url, 302, data)  # Non login
        self.assertRequestDeleteView(url, 403, data, self.viewer)
        self.assertRequestDeleteView(url, 403, data, self.viewer_in_group)
        self.assertRequestDeleteView(url, 403, data, self.contributor)

        # Creator can't add any indicator
        self.assertRequestDeleteView(url, 204, data, self.creator)
        responses = self.assertRequestGetView(url, 200, self.creator)
        self.assertEqual(responses.json()['count'], 0)

        # Resource creator can create this as it has share permission
        responses = self.assertRequestGetView(url, 200, self.resource_creator)
        self.assertEqual(responses.json()['count'], 2)
        self.assertRequestDeleteView(url, 204, data, self.resource_creator)
        responses = self.assertRequestGetView(url, 200, self.resource_creator)
        self.assertEqual(responses.json()['count'], 1)

        # Admin add it, but the data still same
        self.assertRequestDeleteView(url, 204, data, self.admin)
        responses = self.assertRequestGetView(url, 200, self.admin)
        self.assertEqual(responses.json()['count'], 1)
