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
__date__ = '02/04/2026'
__copyright__ = ('Copyright 2026, Unicef')

from unittest.mock import patch

from django.urls import reverse

from core.models.profile import ROLES
from core.tests.base_tests import APITestCase
from core.tests.model_factories import create_user
from geosight.data_restorer.models import (
    Preferences, RequestRestoreData
)

URL_REQUEST = reverse('data-restorer-request')
URL_STATUS = reverse('data-restorer-request-status')
URL_DISABLE = reverse('data-restorer-preferences-disable')


class BaseDataRestorerAPITest(APITestCase):
    """Base test with admin and non-admin users."""

    def setUp(self):
        """Set up users."""
        super(BaseDataRestorerAPITest, self).setUp()
        self.admin = create_user(
            ROLES.SUPER_ADMIN.name,
            password=self.password, is_staff=True, is_superuser=True
        )
        self.viewer = create_user(
            ROLES.VIEWER.name, password=self.password
        )


class RequestRestoreDataAPITest(BaseDataRestorerAPITest):
    """Tests for POST /api/data-restorer/request/."""

    def test_non_admin_gets_403(self):
        """Non-admin cannot create a restore request."""
        self.assertRequestPostView(
            URL_REQUEST, 403, {'data_type': 'Default'}, user=self.viewer
        )

    def test_anonymous_gets_403(self):
        """Anonymous user cannot create a restore request."""
        self.assertRequestPostView(URL_REQUEST, 403, {'data_type': 'Default'})

    def test_returns_400_when_disabled(self):
        """Returns 400 when preferences is disabled."""
        preferences = Preferences.load()
        preferences.enable_request = False
        preferences.save()

        self.assertRequestPostView(
            URL_REQUEST, 400, {'data_type': 'Default'}, user=self.admin
        )

    def test_creates_request_and_dispatches_task(self):
        """Full flow: creates RequestRestoreData, runs task, state is FINISH."""
        from geosight.data_restorer.tasks import run_request_restore_data

        def run_synchronously(request_id):
            run_request_restore_data(request_id)

        with patch(
            'geosight.data_restorer.api.run_request_restore_data'
        ) as mock_task, patch(
            'django.core.management.call_command'
        ):
            mock_task.delay.side_effect = run_synchronously

            self.assertRequestPostView(
                URL_REQUEST, 201, {'data_type': 'Default'},
                user=self.admin, content_type=self.JSON_CONTENT
            )

        self.assertTrue(RequestRestoreData.objects.exists())
        obj = RequestRestoreData.objects.first()
        self.assertEqual(obj.data_type, 'Default')
        self.assertEqual(obj.state, RequestRestoreData.State.FINISH)

        preferences = Preferences.load()
        self.assertFalse(preferences.enable_request)

        response = self.assertRequestGetView(URL_STATUS, 200, user=self.admin)
        data = response.json()
        self.assertEqual(data['data_type'], 'Default')
        self.assertEqual(data['state'], RequestRestoreData.State.FINISH)


class RequestRestoreDataDetailAPITest(BaseDataRestorerAPITest):
    """Tests for GET /api/data-restorer/request/status/."""

    def test_non_admin_gets_403(self):
        """Non-admin cannot access status."""
        self.assertRequestGetView(URL_STATUS, 403, user=self.viewer)

    def test_returns_404_when_no_records(self):
        """Returns 404 when no restore request exists."""
        self.assertRequestGetView(URL_STATUS, 404, user=self.admin)

    def test_returns_last_request(self):
        """Returns data_type and state of the last request."""
        RequestRestoreData.objects.create(data_type='Default')
        last = RequestRestoreData.objects.create(
            data_type='Demo', state=RequestRestoreData.State.RUNNING
        )

        response = self.assertRequestGetView(URL_STATUS, 200, user=self.admin)
        data = response.json()
        self.assertEqual(data['data_type'], last.data_type)
        self.assertEqual(data['state'], last.state)
        self.assertNotIn('id', data)


class PreferencesAPITest(BaseDataRestorerAPITest):
    """Tests for POST /api/data-restorer/preferences/disable/."""

    def test_non_admin_gets_403(self):
        """Non-admin cannot disable preferences."""
        self.assertRequestPostView(URL_DISABLE, 403, {}, user=self.viewer)

    def test_disables_preferences(self):
        """Sets enable_request to False."""
        preferences = Preferences.load()
        self.assertTrue(preferences.enable_request)

        self.assertRequestPostView(URL_DISABLE, 200, {}, user=self.admin)

        preferences.refresh_from_db()
        self.assertFalse(preferences.enable_request)
