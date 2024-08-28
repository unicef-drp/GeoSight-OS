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
from django.urls import reverse

from geosight.data.models.style import Style
from geosight.permission.models.factory import PERMISSIONS
from geosight.permission.tests._base import BasePermissionTest

User = get_user_model()


class StyleListApiTest(BasePermissionTest.TestCase):
    """Test for style list api."""

    payload = {
        'name': 'name'
    }

    def create_resource(self, user):
        """Create resource function."""
        payload = copy.deepcopy(self.payload)
        return Style.permissions.create(
            user=user,
            **payload
        )

    def get_resources(self, user):
        """Create resource function."""
        return Style.permissions.list(user).order_by('id')

    def test_get_api(self):
        """Test get permission API."""
        url = reverse(
            'style-permission-api', kwargs={'pk': self.resource.id})

        self.assertRequestGetView(url, 403)  # Non login
        self.assertRequestGetView(url, 403, self.viewer)
        self.assertRequestGetView(url, 403, self.contributor)
        self.assertRequestGetView(url, 403, self.creator)
        self.assertRequestGetView(url, 200, self.resource_creator)
        self.assertRequestGetView(url, 403, self.viewer_in_group)
        self.assertRequestGetView(url, 403, self.creator_in_group)

        self.permission.update_group_permission(
            self.group, PERMISSIONS.SHARE.name)
        self.assertRequestGetView(url, 403, self.viewer_in_group)
        self.assertRequestGetView(url, 200, self.creator_in_group)
