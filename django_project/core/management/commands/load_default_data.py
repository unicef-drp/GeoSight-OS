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

from django.core.management import call_command
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    """Load demo data for geosight."""

    fixtures = [
        'core/fixtures/default/1.core.json',
        'core/fixtures/default/2.geosight_data.json',
        'core/fixtures/default/3.geosight_permission.json'
    ]

    def handle(self, *args, **options):
        """Command handler."""
        for fixture in self.fixtures:
            call_command('loaddata', fixture)
