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

from core.tests.base_tests import TestCase
from geosight.data_restorer.models import (
    Preferences, RequestRestoreData
)


class PreferencesTest(TestCase):
    """Tests for Preferences model."""

    def setUp(self):
        """Set up test."""
        super(PreferencesTest, self).setUp()

    def test_is_enabled_default(self):
        """Preferences is enabled by default."""
        preferences = Preferences.load()
        self.assertTrue(preferences.is_enabled)

    def test_is_enabled_false_when_disabled(self):
        """Preferences is not enabled when enable_request is False."""
        preferences = Preferences.load()
        preferences.enable_request = False
        preferences.save()
        self.assertFalse(preferences.is_enabled)

    def test_is_enabled_false_when_color_palette_exists(self):
        """Preferences is not enabled when a ColorPalette exists."""
        from core.models.color import ColorPalette
        palette = ColorPalette.objects.create(name='test', colors=['#000000'])
        try:
            preferences = Preferences.load()
            self.assertFalse(preferences.is_enabled)
        finally:
            palette.delete()


class RequestRestoreDataTest(TestCase):
    """Tests for RequestRestoreData model."""

    def setUp(self):
        """Set up test."""
        super(RequestRestoreDataTest, self).setUp()

    def test_default_state_is_created(self):
        """New record defaults to CREATED state."""
        obj = RequestRestoreData.objects.create(data_type='Default')
        self.assertEqual(obj.state, RequestRestoreData.State.CREATED)

    def test_run_does_nothing_when_disabled(self):
        """run() returns early when preferences is disabled."""
        preferences = Preferences.load()
        preferences.enable_request = False
        preferences.save()

        obj = RequestRestoreData.objects.create(data_type='Default')
        obj.run()

        obj.refresh_from_db()
        self.assertEqual(obj.state, RequestRestoreData.State.CREATED)

    def test_run_does_nothing_for_unknown_data_type(self):
        """run() returns early when data_type has no matching fixture."""
        obj = RequestRestoreData.objects.create(data_type='Default')
        obj.data_type = 'Unknown'  # bypass model choices

        with patch('django.core.management.call_command') as mock_cmd:
            obj.run()
            mock_cmd.assert_not_called()

        self.assertEqual(obj.state, RequestRestoreData.State.CREATED)

    def test_run_full_flow(self):
        """run() transitions created -> running -> finish and disables prefs."""
        obj = RequestRestoreData.objects.create(data_type='Default')

        states = []

        def fake_call_command(command_name):
            obj.refresh_from_db()
            states.append(obj.state)

        with patch(
                'django.core.management.call_command',
                side_effect=fake_call_command
        ):
            obj.run()

        obj.refresh_from_db()
        self.assertEqual(states, [RequestRestoreData.State.RUNNING])
        self.assertEqual(obj.state, RequestRestoreData.State.FINISH)

        preferences = Preferences.load()
        self.assertFalse(preferences.enable_request)
