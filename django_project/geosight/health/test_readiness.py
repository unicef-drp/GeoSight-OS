# coding=utf-8
"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""
__author__ = 'danang@kartoza.com'
__date__ = '22/10/2024'
__copyright__ = ('Copyright 2023, Unicef')

from django.test import TestCase, override_settings
from django.urls import reverse
from django.core.cache import cache
from unittest.mock import patch, MagicMock
import tempfile


@override_settings(
    CACHES={
        'default': {
            'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
            'LOCATION': 'unique-test-cache',
        }
    }
)
class ReadinessProbeTest(TestCase):
    """Test suite for readiness probe endpoint."""

    def setUp(self):
        """Set up test environment."""
        self.url = reverse('health-readiness')
        # Clear cache before each test
        cache.clear()

    def tearDown(self):
        """Clean up after tests."""
        cache.clear()

    def test_readiness_probe_all_healthy(self):
        """Test readiness probe when all checks pass."""
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['status'], 'ready')
        self.assertTrue(response.json()['checks']['database'])
        self.assertTrue(response.json()['checks']['redis'])

    def test_readiness_probe_returns_json(self):
        """Test that readiness probe returns valid JSON."""
        response = self.client.get(self.url)
        self.assertEqual(response['Content-Type'], 'application/json')
        data = response.json()
        self.assertIn('status', data)
        self.assertIn('checks', data)

    def test_database_check_passes(self):
        """Test database connectivity check passes."""
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()['checks']['database'])

    @patch('health.views.connection')
    def test_database_check_fails(self, mock_connection):
        """Test readiness probe fails when database is down.

        :param mock_connection: Mocked database connection
        :type mock_connection: MagicMock
        """
        # Mock database connection failure
        mock_cursor = MagicMock()
        mock_cursor.execute.side_effect = Exception(
            "Database connection failed"
        )
        mock_connection.cursor.return_value.__enter__.return_value = (
            mock_cursor
        )
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.json()['status'], 'not ready')
        self.assertFalse(response.json()['checks']['database'])

    def test_redis_check_passes(self):
        """Test Redis connectivity check passes."""
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()['checks']['redis'])

    @patch('health.views.cache')
    def test_redis_check_fails_on_set(self, mock_cache):
        """Test readiness probe fails when Redis set operation fails.

        :param mock_cache: Mocked cache object
        :type mock_cache: MagicMock
        """
        mock_cache.set.side_effect = Exception("Redis connection failed")
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.json()['status'], 'not ready')
        self.assertFalse(response.json()['checks']['redis'])

    @patch('health.views.cache')
    def test_redis_check_fails_on_get(self, mock_cache):
        """Test readiness probe fails when Redis get returns wrong value.

        :param mock_cache: Mocked cache object
        :type mock_cache: MagicMock
        """
        mock_cache.set.return_value = None
        mock_cache.get.return_value = 'wrong_value'
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.json()['status'], 'not ready')
        self.assertFalse(response.json()['checks']['redis'])

    def test_storage_check_passes_with_low_usage(self):
        """Test storage check passes when disk usage is below threshold."""
        with tempfile.TemporaryDirectory() as temp_dir:
            with override_settings(
                LOGS_DIRECTORY=temp_dir,
                STORAGE_CRITICAL_THRESHOLD=98
            ):
                response = self.client.get(self.url)
                self.assertEqual(response.status_code, 200)
                self.assertTrue(response.json()['checks']['storage'])

    @patch('health.views.shutil.disk_usage')
    def test_storage_check_fails_when_usage_exceeds_threshold(
        self, mock_disk_usage
    ):
        """Test storage check fails when disk usage exceeds 98%.

        :param mock_disk_usage: Mocked disk usage function
        :type mock_disk_usage: MagicMock
        """
        # Mock disk usage at 99% (exceeds 98% threshold)
        mock_disk_usage.return_value = MagicMock(
            total=10 * 1024**3,  # 10GB total
            used=9.9 * 1024**3,  # 9.9GB used (99%)
            free=0.1 * 1024**3   # 0.1GB free
        )
        with tempfile.TemporaryDirectory() as temp_dir:
            with override_settings(
                LOGS_DIRECTORY=temp_dir,
                STORAGE_CRITICAL_THRESHOLD=98
            ):
                response = self.client.get(self.url)
                self.assertEqual(response.status_code, 503)
                self.assertEqual(response.json()['status'], 'not ready')
                self.assertFalse(response.json()['checks']['storage'])

    @patch('health.views.shutil.disk_usage')
    def test_storage_check_passes_at_threshold_boundary(self, mock_disk_usage):
        """Test storage check passes when exactly at 98% (not exceeding).

        :param mock_disk_usage: Mocked disk usage function
        :type mock_disk_usage: MagicMock
        """
        # Mock disk usage at exactly 98%
        mock_disk_usage.return_value = MagicMock(
            total=10 * 1024**3,  # 10GB total
            used=9.8 * 1024**3,  # 9.8GB used (98%)
            free=0.2 * 1024**3   # 0.2GB free
        )
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()['checks']['storage'])

    @patch('health.views.shutil.disk_usage')
    def test_storage_check_with_custom_threshold(self, mock_disk_usage):
        """Test storage check respects custom threshold setting.

        :param mock_disk_usage: Mocked disk usage function
        :type mock_disk_usage: MagicMock
        """
        # Mock disk usage at 91%
        mock_disk_usage.return_value = MagicMock(
            total=10 * 1024**3,
            used=9.1 * 1024**3,
            free=0.9 * 1024**3
        )
        with tempfile.TemporaryDirectory() as temp_dir:
            # Test with 90% threshold - should fail
            with override_settings(
                LOGS_DIRECTORY=temp_dir,
                STORAGE_CRITICAL_THRESHOLD=90
            ):
                response = self.client.get(self.url)
                self.assertEqual(response.status_code, 503)
                self.assertFalse(response.json()['checks']['storage'])

    @patch('health.views.connection')
    @patch('health.views.cache')
    def test_multiple_checks_fail(self, mock_cache, mock_connection):
        """Test readiness probe when multiple checks fail.

        :param mock_cache: Mocked cache object
        :type mock_cache: MagicMock
        :param mock_connection: Mocked database connection
        :type mock_connection: MagicMock
        """
        # Mock both database and Redis failures
        mock_cursor = MagicMock()
        mock_cursor.execute.side_effect = Exception("Database failed")
        mock_connection.cursor.return_value.__enter__.return_value = (
            mock_cursor
        )
        mock_cache.set.side_effect = Exception("Redis failed")

        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.json()['status'], 'not ready')
        self.assertFalse(response.json()['checks']['database'])
        self.assertFalse(response.json()['checks']['redis'])

    def test_endpoint_allows_unauthenticated_access(self):
        """Test that readiness endpoint doesn't require authentication."""
        # Should work without any authentication
        response = self.client.get(self.url)
        # Should not return 401 or 403
        self.assertNotEqual(response.status_code, 401)
        self.assertNotEqual(response.status_code, 403)
        # Should return either 200 or 503
        self.assertIn(response.status_code, [200, 503])

    def test_endpoint_only_accepts_get(self):
        """Test that readiness endpoint only accepts GET requests."""
        # GET should work
        get_response = self.client.get(self.url)
        self.assertIn(get_response.status_code, [200, 503])

        # POST should not be allowed
        post_response = self.client.post(self.url)
        self.assertEqual(post_response.status_code, 405)

        # PUT should not be allowed
        put_response = self.client.put(self.url)
        self.assertEqual(put_response.status_code, 405)

        # DELETE should not be allowed
        delete_response = self.client.delete(self.url)
        self.assertEqual(delete_response.status_code, 405)
