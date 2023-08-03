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

import random

from rest_framework import serializers

from core.models.preferences import SitePreferences


class SitePreferencesSerializer(serializers.ModelSerializer):
    """Site preference serializer."""

    icon = serializers.SerializerMethodField()
    favicon = serializers.SerializerMethodField()
    background_image = serializers.SerializerMethodField()
    landing_page_banner = serializers.SerializerMethodField()

    def get_icon(self, obj: SitePreferences):
        """Return icon."""
        return obj.icon.url if obj.icon else ''

    def get_favicon(self, obj: SitePreferences):
        """Return favicon."""
        return obj.favicon.url if obj.favicon else ''

    def get_background_image(self, obj: SitePreferences):
        """Return background_image."""
        count = obj.sitepreferencesimage_set.count()
        if not count:
            return ''
        idx = random.randint(0, count - 1)
        return obj.sitepreferencesimage_set.all()[idx].image.url

    def get_landing_page_banner(self, obj: SitePreferences):
        """Return landing page banner."""
        return obj.landing_page_banner.url if obj.landing_page_banner else ''

    class Meta:  # noqa: D106
        model = SitePreferences
        exclude = (
            'georepo_api_key_level_1', 'georepo_api_key_level_4'
        )
