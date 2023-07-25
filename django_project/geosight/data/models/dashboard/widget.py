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
from geosight.data.models.context_layer import ContextLayer
from geosight.data.models.dashboard.dashboard_relation import (
    DashboardRelation
)
from geosight.data.models.indicator import Indicator


class LayerUsed(object):
    """A quick couple variable for Layer That being used."""

    INDICATOR = 'Indicator'
    INDICATOR_LAYER = 'Indicator Layer'


DATE_FILTER_TYPES = [
    ('No filter', 'No filter (global latest values will be used)'),
    ('Global datetime filter', 'Use datetime filter from Dashboard level.'),
    ('Custom filter', 'Use custom datetime filter.'),
]


# TODO:
#  This widget is deprecated, needs to be removed
class Widget(AbstractTerm, DashboardRelation):
    """Widget model."""

    @property
    def layer_id(self):
        """Return layer based on layer used."""
        if self.layer_used == LayerUsed.INDICATOR \
                and self.indicator:
            return self.indicator.id
        elif self.context_layer:
            return self.context_layer.id
        else:
            return 0

    unit = models.CharField(
        max_length=64,
        null=True, blank=True,
        help_text=(
            "A unit e.g. 'cases', 'people', 'children', "
            "that will be shown alongside the number in reports."
        )
    )

    property = models.CharField(
        max_length=256,
        help_text=(
            "Property key that will be used to calculate to plugin."
        )
    )

    property_2 = models.CharField(
        max_length=256,
        null=True, blank=True,
        help_text=(
            "Second property that will be used for e.g: grouping."
        )
    )

    type = models.CharField(
        max_length=256,
        default="SummaryWidget"
    )

    operation = models.CharField(
        max_length=256,
        default="Sum"
    )

    layer_used = models.CharField(
        max_length=256,
        default=LayerUsed.INDICATOR,
        choices=(
            (LayerUsed.INDICATOR, LayerUsed.INDICATOR),
        )
    )

    indicator = models.ForeignKey(
        Indicator,
        blank=True, null=True,
        on_delete=models.SET_NULL,
        help_text=(
            "Use this layer when layer used is reference layer."
        )
    )
    context_layer = models.ForeignKey(
        ContextLayer,
        blank=True, null=True,
        on_delete=models.SET_NULL,
        help_text=(
            "Use this layer when layer used is context layer."
        )
    )
    date_filter_type = models.CharField(
        max_length=256,
        default=DATE_FILTER_TYPES[0][0],
        choices=DATE_FILTER_TYPES
    )
    date_filter_value = models.CharField(
        max_length=256,
        blank=True, null=True,
    )

    def __str__(self):
        return self.name

    class Meta:  # noqa: D106
        ordering = ('order',)
