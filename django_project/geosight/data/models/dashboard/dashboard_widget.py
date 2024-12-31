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
__date__ = '13/06/2023'
__copyright__ = ('Copyright 2023, Unicef')

from django.contrib.gis.db import models

from core.models.general import AbstractTerm
from geosight.data.models.dashboard.dashboard_relation import (
    DashboardRelationWithLimit
)


class LayerUsed(object):
    """A quick couple variable for Layer That being used."""

    INDICATOR = 'Indicator'
    INDICATOR_LAYER = 'Indicator Layer'


class DashboardWidget(AbstractTerm, DashboardRelationWithLimit):
    """Dashboard Widget model."""

    type = models.CharField(
        max_length=256,
        default="SummaryWidget"
    )
    config = models.JSONField()

    content_limitation_description = (
        'Limit the number of widget per project'
    )

    def __str__(self):
        return self.name

    class Meta:  # noqa: D106
        ordering = ('order',)
