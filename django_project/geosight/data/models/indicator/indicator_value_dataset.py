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

from geosight.data.models.indicator import Indicator, IndicatorValue


class IndicatorValueDataset(models.Model):
    """Indicator value x entity view x admin level."""

    id = models.CharField(max_length=256, primary_key=True)
    indicator_id = models.BigIntegerField()
    reference_layer_id = models.UUIDField()
    admin_level = models.IntegerField()
    data_count = models.IntegerField(
        null=True, blank=True
    )
    min_date = models.DateField(
        null=True, blank=True
    )
    max_date = models.DateField(
        null=True, blank=True
    )
    reference_layer_name = models.CharField(
        max_length=256, null=True, blank=True
    )
    indicator_name = models.CharField(
        max_length=256, null=True, blank=True
    )
    indicator_shortcode = models.CharField(
        max_length=256, null=True, blank=True
    )
    identifier = models.CharField(
        max_length=256, null=True, blank=True
    )

    class Meta:  # noqa: D106
        managed = False

    @property
    def indicator(self):
        """Return indicator."""
        try:
            return Indicator.objects.get(id=self.indicator_id)
        except Indicator.DoesNotExist:
            return None

    def permissions(self, user):
        """Return permission of user."""
        return IndicatorValue.value_permissions(
            user, self.indicator, self.reference_layer_id
        )
