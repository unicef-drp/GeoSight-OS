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
__date__ = '21/04/2026'
__copyright__ = ('Copyright 2023, Unicef')

from django.core.management.base import BaseCommand

from geosight.data.models.dashboard import Dashboard
from geosight.data.models.dashboard.dashboard_indicator_layer import (
    DashboardIndicatorLayer
)
from geosight.data.models.dashboard.dashboard_relation import (
    DashboardContextLayer
)


class Command(BaseCommand):
    """Set override flags based on existing data and clear dashboard cache."""

    def handle(self, *args, **options):
        """Command handler."""
        DashboardContextLayer.objects.exclude(
            layer_name__isnull=True
        ).exclude(layer_name='').update(override_layer_name=True)

        DashboardContextLayer.objects.exclude(
            layer_description__isnull=True
        ).exclude(layer_description='').update(override_layer_description=True)

        DashboardIndicatorLayer.objects.exclude(
            name__isnull=True
        ).exclude(name='').update(override_name=True)

        DashboardIndicatorLayer.objects.exclude(
            description__isnull=True
        ).exclude(description='').update(override_description=True)

        Dashboard.objects.all().update(
            cache_data=None, cache_data_generated_at=None
        )