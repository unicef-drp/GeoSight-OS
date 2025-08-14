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
__date__ = '30/12/2024'
__copyright__ = ('Copyright 2023, Unicef')

from django.contrib.gis.db import models

from geosight.data.models.dashboard.dashboard_relation import (
    DashboardRelation
)


class DashboardTool(DashboardRelation):
    """Dashboard tool."""

    name = models.CharField(max_length=255)
    config = models.JSONField(null=True, blank=True)

    def __str__(self):
        return self.name

    class Meta:  # noqa: D106
        ordering = ('name',)
        unique_together = ('name', 'dashboard')
