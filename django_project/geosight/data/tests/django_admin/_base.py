# coding=utf-8
"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""
__author__ = 'zakki@kartoza.com'
__date__ = '15/01/2025'
__copyright__ = ('Copyright 2025, Unicef')

import copy

from django.contrib.auth import get_user_model
from django.urls import reverse

from core.tests.model_factories import UserF
from geosight.permission.tests._base import BasePermissionTest

User = get_user_model()


class BaseDjangoAdminTest(object):
    """Test for Base Admin."""

    class TestCase(BasePermissionTest.TestCase):
        @property
        def list_url_tag(self):
            """Url list tag."""
            raise NotImplementedError

        @property
        def create_url_tag(self):
            """Url create tag."""
            raise NotImplementedError

        @property
        def edit_url_tag(self):
            """Url edit tag."""
            raise NotImplementedError

        @property
        def payload(self):
            """Payload."""
            raise NotImplementedError

        @property
        def form_payload(self):
            """Form Payload."""
            raise NotImplementedError

        def setUp(self):
            super().setUp()
            self.admin = UserF(
                is_superuser=True,
                is_staff=True,
            )

        def test_create_view(self):
            """Test for create view."""
            url = reverse(self.create_url_tag)
            # POST it
            new_payload = copy.deepcopy(self.form_payload)
            new_payload['name'] = 'name 1'
            new_payload['shortcode'] = 'CODE 2'
            self.get_resources(self.admin)

            self.assertRequestPostView(
                url, 200, new_payload, self.admin, follow=True
            )
            new_resource = self.get_resources(self.admin).last()
            self.assertEqual(new_resource.name, new_payload['name'])
            self.assertEqual(new_resource.creator, self.admin)
            self.assertEqual(new_resource.modified_by, self.admin)

        def test_edit_view(self):
            """Test for edit view."""
            url = reverse(self.edit_url_tag, args=[self.resource.id])

            # POST it
            new_payload = copy.deepcopy(self.form_payload)
            new_payload['name'] = 'name 1'
            self.assertRequestPostView(
                url, 200, new_payload, self.admin, follow=True
            )
            self.assertEqual(self.resource.creator, self.resource_creator)

            self.resource.refresh_from_db()
            self.assertEqual(self.resource.name, new_payload['name'])
            self.assertEqual(self.resource.creator, self.resource_creator)
            self.assertEqual(self.resource.modified_by, self.admin)
