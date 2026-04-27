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
__date__ = '27/04/2026'
__copyright__ = ('Copyright 2023, Unicef')

from django.urls import reverse

from core.models.profile import ROLES
from core.tests.base_tests import APITestCase
from core.tests.model_factories import create_user


class UserApiKeyApiTest(APITestCase):
    """Tests for the UserApiKey API endpoint."""

    def setUp(self):
        """Create users for testing."""
        self.admin = create_user(
            ROLES.SUPER_ADMIN.name, password=self.password
        )
        self.admin.is_superuser = True
        self.admin.is_staff = True
        self.admin.save()
        self.user = create_user(ROLES.CREATOR.name, password=self.password)
        self.other_user = create_user(
            ROLES.CREATOR.name, password=self.password
        )

    def _url(self, user=None):
        """Return the api-key URL for *user* (defaults to self.user).

        :param user: The user whose pk is used in the URL.
        :returns: Resolved URL string.
        :rtype: str
        """
        target = user or self.user
        return reverse('user-api-key', kwargs={'pk': target.id})

    # ------------------------------------------------------------------
    # GET
    # ------------------------------------------------------------------

    def test_get_unauthenticated_is_forbidden(self):
        """Unauthenticated GET must receive 403."""
        self.assertRequestGetView(self._url(), 403)

    def test_get_other_user_is_forbidden(self):
        """A different non-admin user must receive 403 on GET."""
        self.assertRequestGetView(self._url(), 403, user=self.other_user)

    def test_get_owner_receives_empty_list(self):
        """Owner receives 200 with an empty list when no key exists."""
        response = self.assertRequestGetView(self._url(), 200, user=self.user)
        self.assertEqual(response.json(), [])

    def test_get_admin_can_access_any_user(self):
        """Superuser may retrieve API keys for any user."""
        self.assertRequestGetView(self._url(), 200, user=self.admin)

    # ------------------------------------------------------------------
    # POST (create)
    # ------------------------------------------------------------------

    def test_post_unauthenticated_is_forbidden(self):
        """Unauthenticated POST must receive 403."""
        self.assertRequestPostView(
            self._url(), 403, data={}, content_type=self.JSON_CONTENT
        )

    def test_post_other_user_is_forbidden(self):
        """A different non-admin user must receive 403 on POST."""
        self.assertRequestPostView(
            self._url(), 403,
            user=self.other_user, data={}, content_type=self.JSON_CONTENT
        )

    def test_post_owner_creates_key(self):
        """Owner can create an API key; response contains expected fields."""
        response = self.assertRequestPostView(
            self._url(), 201,
            user=self.user, data={}, content_type=self.JSON_CONTENT
        )
        data = response.json()
        self.assertIn('api_key', data)
        self.assertEqual(data['user_id'], f'{self.user.id}')

    def test_post_duplicate_key_returns_400(self):
        """Creating a second key for the same user must return 400."""
        self.assertRequestPostView(
            self._url(), 201,
            user=self.user, data={}, content_type=self.JSON_CONTENT
        )
        self.assertRequestPostView(
            self._url(), 400,
            user=self.user, data={}, content_type=self.JSON_CONTENT
        )

    def test_get_returns_key_after_creation(self):
        """GET returns exactly one key after one has been created."""
        self.assertRequestPostView(
            self._url(), 201,
            user=self.user, data={}, content_type=self.JSON_CONTENT
        )
        response = self.assertRequestGetView(self._url(), 200, user=self.user)
        self.assertEqual(len(response.json()), 1)

    # ------------------------------------------------------------------
    # PUT (activate / deactivate)
    # ------------------------------------------------------------------

    def test_put_non_superuser_is_forbidden(self):
        """Non-superuser PUT must receive 403."""
        self.assertRequestPutView(
            self._url(), 403,
            user=self.user, data={'is_active': False}
        )

    def test_put_superuser_can_deactivate(self):
        """Superuser can deactivate an existing key."""
        self.assertRequestPostView(
            self._url(), 201,
            user=self.user, data={}, content_type=self.JSON_CONTENT
        )
        self.assertRequestPutView(
            self._url(), 204,
            user=self.admin, data={'is_active': False}
        )

    # ------------------------------------------------------------------
    # DELETE
    # ------------------------------------------------------------------

    def test_delete_unauthenticated_is_forbidden(self):
        """Unauthenticated DELETE must receive 403."""
        self.assertRequestDeleteView(self._url(), 403)

    def test_delete_other_user_is_forbidden(self):
        """A different non-admin user must receive 403 on DELETE."""
        self.assertRequestDeleteView(self._url(), 403, user=self.other_user)

    def test_delete_missing_key_returns_404(self):
        """DELETE with no existing key must return 404."""
        self.assertRequestDeleteView(self._url(), 404, user=self.user)

    def test_delete_owner_removes_active_key(self):
        """Owner can delete their own active API key."""
        self.assertRequestPostView(
            self._url(), 201,
            user=self.user, data={}, content_type=self.JSON_CONTENT
        )
        self.assertRequestDeleteView(self._url(), 204, user=self.user)
        response = self.assertRequestGetView(self._url(), 200, user=self.user)
        self.assertEqual(response.json(), [])

    def test_delete_inactive_key_forbidden_for_non_superuser(self):
        """Deleting an inactive key as a non-superuser must return 403."""
        self.assertRequestPostView(
            self._url(), 201,
            user=self.user, data={}, content_type=self.JSON_CONTENT
        )
        self.assertRequestPutView(
            self._url(), 204,
            user=self.admin, data={'is_active': False}
        )
        self.assertRequestDeleteView(self._url(), 403, user=self.user)

    def test_delete_inactive_key_allowed_for_superuser(self):
        """Superuser can delete an inactive key."""
        self.assertRequestPostView(
            self._url(), 201,
            user=self.user, data={}, content_type=self.JSON_CONTENT
        )
        self.assertRequestPutView(
            self._url(), 204,
            user=self.admin, data={'is_active': False}
        )
        self.assertRequestDeleteView(self._url(), 204, user=self.admin)


class UserChangePasswordApiTest(APITestCase):
    """Tests for the UserChangePassword API endpoint."""

    def setUp(self):
        """Create users for testing."""
        self.user = create_user(ROLES.CREATOR.name, password=self.password)
        self.other_user = create_user(
            ROLES.CREATOR.name, password=self.password
        )

    def _url(self, user=None):
        """Return the change-password URL for *user* (defaults to self.user).

        :param user: The user whose pk is used in the URL.
        :returns: Resolved URL string.
        :rtype: str
        """
        target = user or self.user
        return reverse('user-change-password', kwargs={'pk': target.id})

    def test_unauthenticated_is_forbidden(self):
        """Unauthenticated request must receive 403."""
        self.assertRequestPostView(
            self._url(), 403,
            data={'old_password': self.password, 'new_password': 'new'},
            content_type=self.JSON_CONTENT
        )

    def test_other_user_is_forbidden(self):
        """A different authenticated user must receive 403."""
        self.assertRequestPostView(
            self._url(), 403,
            user=self.other_user,
            data={'old_password': self.password, 'new_password': 'new'},
            content_type=self.JSON_CONTENT
        )

    def test_missing_old_password_returns_400(self):
        """Missing old_password field must return 400."""
        self.assertRequestPostView(
            self._url(), 400,
            user=self.user,
            data={'new_password': 'newpassword'},
            content_type=self.JSON_CONTENT
        )

    def test_missing_new_password_returns_400(self):
        """Missing new_password field must return 400."""
        self.assertRequestPostView(
            self._url(), 400,
            user=self.user,
            data={'old_password': self.password},
            content_type=self.JSON_CONTENT
        )

    def test_wrong_old_password_returns_400(self):
        """Incorrect old_password must return 400."""
        self.assertRequestPostView(
            self._url(), 400,
            user=self.user,
            data={'old_password': 'wrong', 'new_password': 'newpassword'},
            content_type=self.JSON_CONTENT
        )

    def test_successful_change_returns_200(self):
        """Valid request by the owner must return 200 and update the password."""
        new_password = 'newpassword123'
        self.assertRequestPostView(
            self._url(), 200,
            user=self.user,
            data={'old_password': self.password, 'new_password': new_password},
            content_type=self.JSON_CONTENT
        )
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password(new_password))
