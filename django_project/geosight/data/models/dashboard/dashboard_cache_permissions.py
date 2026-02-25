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
__date__ = '25/02/2026'
__copyright__ = ('Copyright 2023, Unicef')

from django.contrib.auth import get_user_model
from django.contrib.gis.db import models

from geosight.data.models.context_layer import ContextLayer
from geosight.data.models.dashboard import (
    Dashboard
)
from geosight.data.models.indicator import Indicator
from geosight.data.models.related_table import RelatedTable

User = get_user_model()


class DashboardCachePermissions(models.Model):
    """Dashboard model for caching permissions.

    Permissions is based on dashboard and user.
    """

    dashboard = models.ForeignKey(
        Dashboard,
        on_delete=models.CASCADE
    )
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, null=True, blank=True
    )
    generated_at = models.DateTimeField(auto_now=True)
    cache = models.JSONField(default=dict)

    class Meta:  # noqa: D106
        unique_together = ('dashboard', 'user')

    def generate_cache(self):
        """Generate cache based on dashboard."""
        cache_data = {}
        for row in [
            {
                'dashboard_query': self.dashboard.dashboardindicator_set,
                'model': 'indicators'
            },
            {
                'dashboard_query': self.dashboard.dashboardcontextlayer_set,
                'model': 'context_layers'
            },
            {
                'dashboard_query': self.dashboard.dashboardrelatedtable_set,
                'model': 'related_tables'
            }
        ]:
            key = row['model']
            cache_data_resource = {}

            for _resource in row['dashboard_query'].all().select_related(
                    'object', 'object__permission'
            ):
                try:
                    obj = _resource.object
                    cache_data_resource[
                        _resource.object_id] = obj.permission.all_permission(
                        self.user
                    )
                except (
                        RelatedTable.DoesNotExist,
                        Indicator.DoesNotExist,
                        ContextLayer.DoesNotExist
                ):
                    pass
            cache_data[key] = cache_data_resource

        self.cache = cache_data
        self.save()

    @staticmethod
    def get_cache(dashboard: Dashboard, user: User):
        """Get cache based on dashboard and user."""
        user = user if user.is_authenticated else None
        try:
            return DashboardCachePermissions.objects.get(
                dashboard=dashboard, user=user
            ).cache
        except DashboardCachePermissions.DoesNotExist:
            permission = DashboardCachePermissions(
                dashboard=dashboard, user=user
            )
            permission.generate_cache()
            permission.refresh_from_db()
            return permission.cache
