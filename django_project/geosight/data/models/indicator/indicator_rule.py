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

from geosight.data.models.indicator.indicator import Indicator
from geosight.data.models.rule import RuleModel


class IndicatorRule(RuleModel):
    """The rule of indicator."""

    indicator = models.ForeignKey(
        Indicator,
        on_delete=models.CASCADE
    )

    class Meta:  # noqa: D106
        unique_together = ('indicator', 'name')
        ordering = ('order',)

    @property
    def unit(self):
        """Return unit of the rule."""
        unit = ''
        if self.indicator.unit:
            unit = f'{self.indicator.unit}'
        return unit
