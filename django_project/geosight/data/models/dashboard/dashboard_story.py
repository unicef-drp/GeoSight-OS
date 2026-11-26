# coding=utf-8
"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""
__author__ = 'ishaan.jain@emory.edu'
__date__ = '22/01/2026'
__copyright__ = ('Copyright 2026, Unicef')

from django.contrib.gis.db import models

from core.models.general import AbstractTerm, IconTerm
from geosight.data.models.dashboard.bookmark import DashboardBookmark
from geosight.data.models.dashboard.dashboard_relation import (
    DashboardRelationWithLimit
)


class DashboardStory(AbstractTerm, IconTerm, DashboardRelationWithLimit):
    """Dashboard story model."""

    bookmark = models.ForeignKey(
        DashboardBookmark,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )

    config = models.JSONField(null=True, blank=True)

    content_limitation_description = (
        'Limit the number of stories per project'
    )

    def __str__(self):
        return self.name

    class Meta:  # noqa: D106
        ordering = ('order',)
