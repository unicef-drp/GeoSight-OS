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
from django_tenants.test.client import TenantClient as Client

from core.models.profile import ROLES
from core.tests.base_tests import TenantTestCase as TestCase
from core.tests.model_factories import GroupF, create_user
from geosight.data.models.indicator import Indicator
from geosight.georepo.models import ReferenceLayerView
from geosight.georepo.models.reference_layer import ReferenceLayerIndicator

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

    def assertRequestGetView(self, url, code, user=None):
        """Assert request GET view with code."""
        client = Client(self.tenant)
        if user:
            client.login(username=user.username, password=self.password)
        response = client.get(url)
        self.assertEquals(response.status_code, code)
        return response

    def test_get_api(self):
        """Test list of resource."""
        url = reverse('data-access-general-api')

        self.assertRequestGetView(url, 302)  # Non login
        self.assertRequestGetView(url, 403, self.viewer)
        self.assertRequestGetView(url, 403, self.contributor)
        self.assertRequestGetView(url, 403, self.creator)
        self.assertRequestGetView(url, 403, self.resource_creator)
        self.assertRequestGetView(url, 403, self.viewer_in_group)
        self.assertRequestGetView(url, 200, self.admin)

        url = reverse('data-access-users-api')

        self.assertRequestGetView(url, 302)  # Non login
        self.assertRequestGetView(url, 403, self.viewer)
        self.assertRequestGetView(url, 403, self.contributor)
        self.assertRequestGetView(url, 403, self.creator)
        self.assertRequestGetView(url, 403, self.resource_creator)
        self.assertRequestGetView(url, 403, self.viewer_in_group)
        self.assertRequestGetView(url, 200, self.admin)

        url = reverse('data-access-groups-api')

        self.assertRequestGetView(url, 302)  # Non login
        self.assertRequestGetView(url, 403, self.viewer)
        self.assertRequestGetView(url, 403, self.contributor)
        self.assertRequestGetView(url, 403, self.creator)
        self.assertRequestGetView(url, 403, self.resource_creator)
        self.assertRequestGetView(url, 403, self.viewer_in_group)
        self.assertRequestGetView(url, 200, self.admin)
