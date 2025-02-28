# coding=utf-8
"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""
__author__ = 'zakki@kartoza.com'
__date__ = '19/02/2025'
__copyright__ = ('Copyright 2023, Unicef')

from django.core.management.base import BaseCommand

from geosight.data.models.indicator import IndicatorValue


class Command(BaseCommand):
    """Reassign indicator value flat table."""

    def handle(self, *args, **options):
        """Command handler."""
        IndicatorValue.assign_flat_table()
