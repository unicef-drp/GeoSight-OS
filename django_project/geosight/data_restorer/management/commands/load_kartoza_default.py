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
__copyright__ = ('Copyright 2025, Unicef')

import os

from django.core.files import File
from django.core.management import call_command
from django.core.management.base import BaseCommand

from core.settings.utils import ABS_PATH


class Command(BaseCommand):
    """Load kartoza default data for geosight."""

    fixtures = [
        'kartoza_default/0.preferences.json',
        'kartoza_default/1.core.json',
        'kartoza_default/2.geosight_data.json',
        'kartoza_default/3.geosight_permission.json',
        'kartoza_default/4.docs.json'
    ]

    # Mapping of BasemapLayer pk to icon filename
    basemap_icons = {
        1: 'basemap-osm.png',
        2: 'basemap-opentopo.png',
    }

    def handle(self, *args, **options):
        """Command handler."""
        from geosight.data_restorer.models import Preferences
        preferences = Preferences.load()
        if preferences.is_kartoza_data_restored:
            print(
                'Kartoza default data already restored, skipping.'
            )
            return

        for fixture in self.fixtures:
            call_command(
                'loaddata', fixture
            )
        self.load_icons()
        self.load_site_preferences_icons()

        preferences.is_kartoza_data_restored = True
        preferences.save()

    def load_icons(self):
        """Save icons to BasemapLayer.icon field."""
        from geosight.data.models.basemap_layer import BasemapLayer

        icons_dir = ABS_PATH(
            'geosight', 'data_restorer', 'fixtures', 'kartoza_default', 'icons'
        )
        for pk, filename in self.basemap_icons.items():
            filepath = os.path.join(icons_dir, filename)
            if not os.path.isfile(filepath):
                continue
            try:
                basemap = BasemapLayer.objects.get(pk=pk)
                with open(filepath, 'rb') as f:
                    basemap.icon.save(filename, File(f), save=True)
            except BasemapLayer.DoesNotExist:
                pass

    @staticmethod
    def load_site_preferences_icons():
        """Save icon and banner to SitePreferences fields."""
        from core.models.preferences import SitePreferences

        icons_dir = ABS_PATH(
            'geosight', 'data_restorer', 'fixtures', 'kartoza_default', 'icons'
        )
        preferences = SitePreferences.load()

        favicon_path = os.path.join(icons_dir, 'favicon.svg')
        if os.path.isfile(favicon_path):
            with open(favicon_path, 'rb') as f:
                preferences.favicon.save('favicon.svg', File(f), save=False)

        white_icon_path = os.path.join(icons_dir, 'white-icon.svg')
        if os.path.isfile(white_icon_path):
            for field in (preferences.icon, preferences.small_icon):
                with open(white_icon_path, 'rb') as f:
                    field.save('white-icon.svg', File(f), save=False)

        banner_path = os.path.join(icons_dir, 'banner.png')
        if os.path.isfile(banner_path):
            with open(banner_path, 'rb') as f:
                preferences.landing_page_banner.save(
                    'banner.png', File(f), save=False
                )

        preferences.save()
