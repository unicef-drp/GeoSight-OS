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
from django.test.client import Client, MULTIPART_CONTENT

from core.models.profile import ROLES
from core.tests.model_factories import GroupF, create_user

User = get_user_model()


class BasePermissionTest:
    """Test for Base Permission."""

    password = 'password'

    def create_resource(self, user):
        """Create resource function."""
        raise NotImplemented

    def get_resources(self, user):
        """Create resource function."""
        raise NotImplemented

    def setUp(self):
        """To setup test."""
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

    def assertRequestGetView(self, url, code, user=None):
        """Assert request GET view with code."""
        client = Client()
        if user:
            client.login(username=user.username, password=self.password)
        response = client.get(url)
        self.assertEquals(response.status_code, code)
        return response

    def assertRequestPostView(
            self, url, code, data, user=None, content_type=MULTIPART_CONTENT
    ):
        """Assert request POST view with code."""
        client = Client()
        if user:
            client.login(username=user.username, password=self.password)
        response = client.post(url, data=data, content_type=content_type)
        self.assertEquals(response.status_code, code)
        return response

    def assertRequestDeleteView(
            self, url, code, user=None, data=None,
            content_type="application/json"
    ):
        """Assert request DELETE view with code."""
        client = Client()
        if user:
            client.login(username=user.username, password=self.password)
        response = client.delete(url, data=data, content_type=content_type)
        self.assertEquals(response.status_code, code)
        return response
