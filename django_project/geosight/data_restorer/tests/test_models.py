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


class PreferencesIsEnabledTest(TestCase):
    """Tests for Preferences.is_enabled."""

    def test_is_enabled_default(self):
        """Preferences is enabled by default with no data."""
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
        obj = ColorPalette.objects.create(name='test', colors=['#000000'])
        try:
            self.assertFalse(Preferences.load().is_enabled)
        finally:
            obj.delete()

    def test_is_enabled_false_when_basemap_layer_exists(self):
        """Preferences is not enabled when a BasemapLayer exists."""
        from geosight.data.tests.model_factories.basemap_layer import BasemapLayerF
        obj = BasemapLayerF()
        try:
            self.assertFalse(Preferences.load().is_enabled)
        finally:
            obj.delete()

    def test_is_enabled_false_when_indicator_exists(self):
        """Preferences is not enabled when an Indicator exists."""
        from geosight.data.tests.model_factories.indicator.indicator import IndicatorF
        obj = IndicatorF()
        try:
            self.assertFalse(Preferences.load().is_enabled)
        finally:
            obj.delete()

    def test_is_enabled_false_when_dashboard_exists(self):
        """Preferences is not enabled when a Dashboard exists."""
        from geosight.data.tests.model_factories.dashboard.dashboard import DashboardF
        obj = DashboardF()
        try:
            self.assertFalse(Preferences.load().is_enabled)
        finally:
            obj.delete()

    def test_is_enabled_false_when_context_layer_exists(self):
        """Preferences is not enabled when a ContextLayer exists."""
        from geosight.data.tests.model_factories.context_layers import ContextLayerF
        obj = ContextLayerF()
        try:
            self.assertFalse(Preferences.load().is_enabled)
        finally:
            obj.delete()

    def test_is_enabled_false_when_related_table_exists(self):
        """Preferences is not enabled when a RelatedTable exists."""
        from geosight.data.tests.model_factories.related_table import RelatedTableF
        obj = RelatedTableF()
        try:
            self.assertFalse(Preferences.load().is_enabled)
        finally:
            obj.delete()

    def test_is_enabled_false_when_style_exists(self):
        """Preferences is not enabled when a Style exists."""
        from geosight.data.models import Style
        obj = Style.objects.create(name='test-style')
        try:
            self.assertFalse(Preferences.load().is_enabled)
        finally:
            obj.delete()

    def test_is_enabled_true_when_restore_request_is_created(self):
        """A CREATED restore request does not disable preferences."""
        obj = RequestRestoreData.objects.create(data_type='Default')
        try:
            self.assertTrue(Preferences.load().is_enabled)
        finally:
            obj.delete()

    def test_is_enabled_false_when_restore_request_is_running(self):
        """Preferences is not enabled when a restore request is RUNNING."""
        obj = RequestRestoreData.objects.create(
            data_type='Default', state=RequestRestoreData.State.RUNNING
        )
        try:
            self.assertFalse(Preferences.load().is_enabled)
        finally:
            obj.delete()

    def test_is_enabled_false_when_restore_request_is_finished(self):
        """Preferences is not enabled when a restore request is FINISH."""
        obj = RequestRestoreData.objects.create(
            data_type='Default', state=RequestRestoreData.State.FINISH
        )
        try:
            self.assertFalse(Preferences.load().is_enabled)
        finally:
            obj.delete()


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

    def test_run_sets_failed_state_on_error(self):
        """run() sets state to FAILED and saves the error note on exception."""
        obj = RequestRestoreData.objects.create(data_type='Default')

        with patch(
                'django.core.management.call_command',
                side_effect=Exception('something went wrong')
        ):
            obj.run()

        obj.refresh_from_db()
        self.assertEqual(obj.state, RequestRestoreData.State.FAILED)
        self.assertIn('something went wrong', obj.note)

    def test_run_failed_does_not_disable_preferences(self):
        """run() does not disable preferences when the command fails."""
        obj = RequestRestoreData.objects.create(data_type='Default')

        with patch(
                'django.core.management.call_command',
                side_effect=Exception('boom')
        ):
            obj.run()

        preferences = Preferences.load()
        self.assertTrue(preferences.enable_request)

    def test_is_enabled_true_after_failed_request(self):
        """A FAILED restore request does not block new requests."""
        obj = RequestRestoreData.objects.create(
            data_type='Default', state=RequestRestoreData.State.FAILED
        )
        try:
            self.assertTrue(Preferences.load().is_enabled)
        finally:
            obj.delete()