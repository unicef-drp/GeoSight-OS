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
from django.test.testcases import TestCase
from django.urls import reverse

from core.models.profile import ROLES
from core.tests.model_factories import create_user
from frontend.tests.admin._base import BaseViewTest

User = get_user_model()


class UserAdminViewTest(BaseViewTest, TestCase):
    """Test for User Admin."""

    list_url_tag = 'admin-user-list-view'
    create_url_tag = 'admin-user-create-view'
    edit_url_tag = 'admin-user-edit-view'

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

    def create_resource(self, user):
        """Create resource function."""
        return create_user(
            ROLES.VIEWER.name, password=self.password)

    def get_resources(self, user):
        """Create resource function."""
        return User.objects.all()

    def test_list_view(self):
        """Test for list view."""
        url = reverse(self.list_url_tag)
        self.assertRequestGetView(url, 302)  # Non login
        self.assertRequestGetView(url, 403, self.viewer)  # Viewer
        self.assertRequestGetView(url, 403, self.contributor)  # Contributor
        self.assertRequestGetView(url, 403, self.creator)  # Creator
        self.assertRequestGetView(url, 200, self.admin)  # Admin

    def test_create_view(self):
        """Test for create view."""
        url = reverse(self.create_url_tag)
        self.assertRequestGetView(url, 302)  # Non login
        self.assertRequestGetView(url, 403, self.viewer)  # Viewer
        self.assertRequestGetView(url, 403, self.contributor)  # Contributor
        self.assertRequestGetView(url, 403, self.creator)  # Creator
        self.assertRequestGetView(url, 200, self.admin)  # Admin

    def test_edit_view(self):
        """Test for edit view."""
        url = reverse(self.edit_url_tag, kwargs={'username': 'username'})
        self.assertRequestGetView(url, 302)  # Resource not found

        url = reverse(
            self.edit_url_tag, kwargs={'username': self.resource.username})
        self.assertRequestGetView(url, 302)  # Non login
        self.assertRequestGetView(url, 403, self.viewer)  # Viewer
        self.assertRequestGetView(url, 403, self.contributor)  # Contributor
        self.assertRequestGetView(url, 403, self.creator)  # Creator
        self.assertRequestGetView(url, 403, self.resource_creator)  # Creator
        self.assertRequestGetView(url, 200, self.admin)  # Admin
