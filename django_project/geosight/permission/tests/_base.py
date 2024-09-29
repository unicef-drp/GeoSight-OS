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

from abc import ABC
from unittest.mock import patch

from django.contrib.auth import get_user_model
from rest_framework.reverse import reverse

from core.models.profile import ROLES
from core.tests.base_tests import APITestCase
from core.tests.model_factories import GroupF, create_user

User = get_user_model()


class BasePermissionTest(object):
    """Permission test."""

    class TestCase(ABC, APITestCase):
        """Test for Base Permission."""

        def create_resource(self, user):
            """Create resource function."""
            raise NotImplemented

        def get_resources(self, user):
            """Create resource function."""
            raise NotImplemented

        def setUp(self):
            """To setup test."""
            from geosight.georepo.tests.mock import mock_get_entity
            self.admin = create_user(
                ROLES.SUPER_ADMIN.name, password=self.password)
            self.creator = create_user(
                ROLES.CREATOR.name, password=self.password)
            self.contributor = create_user(
                ROLES.CONTRIBUTOR.name, password=self.password)
            self.viewer = create_user(
                ROLES.VIEWER.name, password=self.password)
            self.resource_creator = create_user(ROLES.CREATOR.name)

            # Resource layer attribute
            self.resource = self.create_resource(self.resource_creator)
            try:
                self.permission = self.resource.permission
            except AttributeError:
                pass

            # Creating group
            self.group = GroupF()
            self.viewer_in_group = create_user(ROLES.VIEWER.name)
            self.viewer_in_group.groups.add(self.group)
            self.contributor_in_group = create_user(ROLES.CONTRIBUTOR.name)
            self.contributor_in_group.groups.add(self.group)
            self.creator_in_group = create_user(ROLES.CREATOR.name)
            self.creator_in_group.groups.add(self.group)

            # Patch
            self.entity_patcher = patch(
                'geosight.georepo.models.entity.Entity.get_entity',
                mock_get_entity
            )
            self.entity_patcher.start()

        def tearDown(self):
            """Stop the patcher."""
            try:
                self.entity_patcher.stop()
            except AttributeError:
                pass

        def check_delete_resource_with_different_users(self, id, view_name):
            """Check the DELETE method of the given view with different users.

            This test will check the DELETE method for
            viewer, creator and admin.
            """
            url = reverse(view_name, args=[id])
            self.assertRequestDeleteView(url, 403)

            url = reverse(view_name, args=[id])
            self.assertRequestDeleteView(url, 403, user=self.viewer)

            url = reverse(view_name, args=[id])
            self.assertRequestDeleteView(url, 403, user=self.creator)

            url = reverse(view_name, args=[id])
            self.assertRequestDeleteView(url, 204, user=self.admin)
