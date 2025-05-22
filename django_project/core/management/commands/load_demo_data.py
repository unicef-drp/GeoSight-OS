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
__date__ = '22/05/2025'
__copyright__ = ('Copyright 2025, Unicef')

from django.core.management import call_command
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    """Load demo data fro geosight."""

    fixtures = [
        'core/fixtures/demo/1.core.json',
        'core/fixtures/demo/2.user_group.json',
        'core/fixtures/demo/3.geosight_georepo.json',
        (
            'geosight/reference_dataset/fixtures/test/'
            '4.reference_dataset_levels.json'
        ),
        'core/fixtures/demo/4.geosight_data.json',
        'core/fixtures/demo/5.geosight_permission.json',
    ]

    def handle(self, *args, **options):
        """Command handler."""
        for fixture in self.fixtures:
            call_command('loaddata', fixture)
