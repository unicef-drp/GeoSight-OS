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

from core.management.commands.load_demo_data import (
    Command as LoadDemoDataCommand
)


class Command(LoadDemoDataCommand):
    """Load demo data fro geosight."""

    fixtures = [
        'core/fixtures/demo/1.core.json',
        'core/fixtures/demo/2.user_group.json',
        'core/fixtures/demo/3.geosight_georepo.json',
        'core/fixtures/demo/3.geosight_georepo_levels.json',
        'core/fixtures/demo/4.geosight_data.json',
        'core/fixtures/demo/5.geosight_permission.json',
        'core/fixtures/demo/2.preferences_default_dataset.json',
    ]
