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
__date__ = '28/06/2023'
__copyright__ = ('Copyright 2023, Unicef')

from django.contrib.auth import get_user_model
from django.contrib.gis.db import models

from geosight.data.models.dashboard.dashboard_indicator_layer import (
    DashboardIndicatorLayerRelatedTable
)
from geosight.data.models.rule import RuleModel

User = get_user_model()


class DashboardIndicatorLayerRelatedTableRule(RuleModel):
    """Indicator x Dashboard rule."""

    object = models.ForeignKey(
        DashboardIndicatorLayerRelatedTable,
        on_delete=models.CASCADE
    )

    class Meta:  # noqa: D106
        unique_together = ('object', 'name')
        ordering = ('order',)
