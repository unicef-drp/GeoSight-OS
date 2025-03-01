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
__date__ = '05/12/2023'
__copyright__ = ('Copyright 2023, Unicef')

from django.contrib.gis.db import models

from geosight.data.models.indicator import Indicator


class IndicatorValueDataset(models.Model):
    """Indicator value x entity view x admin level."""

    id = models.CharField(max_length=256, primary_key=True)

    # Indicator
    indicator_id = models.BigIntegerField()
    indicator_name = models.CharField(
        max_length=256, null=True, blank=True
    )

    # Country
    country_id = models.BigIntegerField()
    country_name = models.CharField(
        max_length=256, null=True, blank=True
    )
    entity_admin_level = models.CharField(max_length=256)

    data_count = models.IntegerField(
        null=True, blank=True
    )
    start_date = models.DateField(
        null=True, blank=True
    )
    end_date = models.DateField(
        null=True, blank=True
    )

    class Meta:  # noqa: D106
        managed = False
        db_table = "no_table"

    @property
    def indicator(self):
        """Return indicator."""
        try:
            return Indicator.objects.get(id=self.indicator_id)
        except Indicator.DoesNotExist:
            return None

    def permissions(self, user):
        """Return permission of user."""
        return self.indicator.permission.all_permission(user)
