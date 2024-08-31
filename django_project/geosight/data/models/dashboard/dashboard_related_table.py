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

from geosight.data.models.dashboard.dashboard_relation import DashboardRelation
from geosight.data.models.related_table import RelatedTable


class DashboardRelatedTable(DashboardRelation):
    """RelatedTable x Dashboard rule."""

    object = models.ForeignKey(
        RelatedTable,
        on_delete=models.CASCADE
    )
    geography_code_type = models.TextField(default='ucode')
    geography_code_field_name = models.TextField(
        null=True, blank=True
    )
    selected_related_fields = models.JSONField(
        null=True, blank=True
    )
    query = models.TextField(null=True, blank=True)

    content_limitation_description = (
        'Limit the number of related table per project'
    )

    class Meta:  # noqa: D106
        ordering = ('order',)
