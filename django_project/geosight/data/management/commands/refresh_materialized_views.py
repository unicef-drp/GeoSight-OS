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
__date__ = '05/07/2023'
__copyright__ = ('Copyright 2023, Unicef')

from django.core.management.base import BaseCommand

from core.models.materialized_view import MaterializeViewModel


class Command(BaseCommand):
    """Refresh materialized views."""

    def handle(self, *args, **options):
        """Command handler."""
        for _class in MaterializeViewModel.child_classes():
            _class.refresh_materialized_views()
