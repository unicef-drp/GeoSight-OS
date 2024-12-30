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
from django.utils.translation import gettext_lazy as _

from geosight.data.models.dashboard.dashboard_relation import (
    DashboardRelation
)


class ToolName(models.TextChoices):
    """Choices of request status."""

    COMPARE_LAYERS = 'COMPARE_LAYERS', _('Compare layers')
    VIEW_3D = 'VIEW_3D', _('3D view')
    MEASUREMENT = 'MEASUREMENT', _('Measurement')
    ZONAL_ANALYSIS = 'ZONAL_ANALYSIS', _('Zonal analysis')


class DashboardTool(DashboardRelation):
    """Dashboard tool."""

    name = models.CharField(
        max_length=255,
        choices=ToolName.choices
    )
    config = models.JSONField(null=True, blank=True)

    def __str__(self):
        return self.name

    class Meta:  # noqa: D106
        ordering = ('name',)
        unique_together = ('name', 'dashboard')
