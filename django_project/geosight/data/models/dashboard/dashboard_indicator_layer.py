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

from datetime import datetime

import pytz
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.gis.db import models
from django.utils.dateparse import parse_datetime
from django.utils.translation import ugettext_lazy as _

from geosight.data.models.dashboard.dashboard_relation import DashboardRelation
from geosight.data.models.field_layer import FieldLayerAbstract
from geosight.data.models.indicator import (
    Indicator, IndicatorValue
)
from geosight.data.models.related_table import RelatedTable
from geosight.data.models.rule import RuleModel
from geosight.data.models.style.indicator_style import IndicatorStyleBaseModel

User = get_user_model()

default_chart_style = {
    "size": 50, "sizeType": "Fixed size", "chartType": "Pie"

}
MULTIPLE_LAYER_MODE = (
    ("Chart", "Chart"),
    ("Pin", "Pin")
)
POPUP_TYPES = (
    ("Simplified", "Simplified"),
    ("Custom", "Custom")
)
TYPE_SINGLE_INDICATOR = 'Single Indicator'
TYPE_MULTI_INDICATOR = 'Multi Indicator'
TYPE_DYNAMIC_INDICATOR = 'Dynamic Indicator'
TYPE_RELATED_TABLE = 'Related Table'
LAYER_TYPES = (
    (TYPE_SINGLE_INDICATOR, TYPE_SINGLE_INDICATOR),
    (TYPE_MULTI_INDICATOR, TYPE_MULTI_INDICATOR),
    (TYPE_DYNAMIC_INDICATOR, TYPE_DYNAMIC_INDICATOR),
    (TYPE_RELATED_TABLE, TYPE_RELATED_TABLE),
)


class DashboardIndicatorLayer(DashboardRelation, IndicatorStyleBaseModel):
    """Indicator Layer x Dashboard model."""

    name = models.CharField(
        max_length=512,
        blank=True, null=True
    )
    description = models.TextField(
        blank=True, null=True
    )
    level_config = models.JSONField(null=True, blank=True, default=dict)
    type = models.CharField(
        max_length=48,
        choices=LAYER_TYPES,
        default=TYPE_SINGLE_INDICATOR
    )

    # Popup template
    popup_type = models.CharField(
        max_length=24,
        choices=POPUP_TYPES,
        default=POPUP_TYPES[0][0]
    )
    popup_template = models.TextField(
        null=True, blank=True
    )
    override_style = models.BooleanField(default=False)
    override_label = models.BooleanField(default=False)

    # For multiple indicators
    multi_indicator_mode = models.CharField(
        max_length=24,
        choices=MULTIPLE_LAYER_MODE,
        default=MULTIPLE_LAYER_MODE[0][0]
    )
    chart_style = models.JSONField(
        blank=True, null=True,
        help_text=(
            "This is specifically used for multi indicators layer."
            "For single layer, it will use rule of indicator"
        )
    )

    content_limitation_description = (
        'Limit the number of indicator layer per project'
    )

    @property
    def label(self):
        """Return label data."""
        related_tables = self.dashboardindicatorlayerrelatedtable_set
        if related_tables.count():
            return self.name

        # If it is multi indicator
        if self.name:
            return self.name

        layer_indicator = self.dashboardindicatorlayerindicator_set.first()
        indicator = layer_indicator.indicator if layer_indicator else None
        return indicator.name if indicator else ""

    @property
    def desc(self):
        """Return description data."""
        related_tables = self.dashboardindicatorlayerrelatedtable_set
        if related_tables.count():
            return self.description

        # If it is multi indicator
        if self.description:
            return self.description if self.description else ''

        layer_indicator = self.dashboardindicatorlayerindicator_set.first()
        indicator = layer_indicator.indicator if layer_indicator else None
        return indicator.description if indicator else ""

    @property
    def last_update(self):
        """Return last updated."""
        dil_related_table = self.dashboardindicatorlayerrelatedtable_set. \
            first()
        if dil_related_table:
            dashboard_related_table = dil_related_table.related_table. \
                dashboardrelatedtable_set.first()
            date_field = self.dashboardindicatorlayerconfig_set. \
                get(name='date_field').value
            try:
                date_format = self.dashboardindicatorlayerconfig_set. \
                    get(name='date_format').value
            except DashboardIndicatorLayerConfig.DoesNotExist:
                date_format = None
            data, has_next = dil_related_table.related_table.data_with_query(
                reference_layer_uuid=self.dashboard.reference_layer.identifier,
                geo_field=dashboard_related_table.geography_code_field_name,
                geo_type=dashboard_related_table.geography_code_type,
                date_field=date_field,
                date_format=date_format
            )
            data = sorted(data, key=lambda d: d[date_field])
            return parse_datetime(data[-1][date_field]) if data else None

        indicator_ids = self.dashboardindicatorlayerindicator_set.values_list(
            'indicator__id', flat=True)
        first_value = IndicatorValue.objects.filter(
            indicator_id__in=indicator_ids).first()
        if first_value:
            return datetime.combine(
                first_value.date, datetime.min.time(),
                tzinfo=pytz.timezone(settings.TIME_ZONE)
            ).isoformat()
        return None

    @property
    def is_single(self):
        """Return indicator layer is single."""
        return self.type == TYPE_SINGLE_INDICATOR or 'Float'

    @property
    def is_using_obj_style(self):
        """If using obj style."""
        return (
                self.is_single and self.override_style
        ) or self.type == TYPE_DYNAMIC_INDICATOR \
            or self.dashboardindicatorlayerrelatedtable_set.first()

    @property
    def is_using_obj_label(self):
        """If using obj style."""
        return (
                self.is_single and self.override_label
        ) or self.type == TYPE_DYNAMIC_INDICATOR \
            or self.dashboardindicatorlayerrelatedtable_set.first()

    @property
    def rules(self):
        """Return query rules."""
        return self.dashboardindicatorlayerrule_set.all()

    class Meta:  # noqa: D106
        ordering = ('order',)


class DashboardIndicatorLayerRule(RuleModel):
    """DashboardIndicatorLayer x Rule."""

    object = models.ForeignKey(
        DashboardIndicatorLayer,
        on_delete=models.CASCADE
    )

    class Meta:  # noqa: D106
        unique_together = ('object', 'name')
        ordering = ('order',)


class DashboardIndicatorLayerField(FieldLayerAbstract):
    """Indicator Layer x Fields."""

    object = models.ForeignKey(
        DashboardIndicatorLayer,
        on_delete=models.CASCADE
    )

    class Meta:  # noqa: D106
        unique_together = ('object', 'name')


class DashboardIndicatorLayerConfig(models.Model):
    """Dashboard Indicator Another Config."""

    layer = models.ForeignKey(
        DashboardIndicatorLayer, on_delete=models.CASCADE
    )
    name = models.CharField(
        max_length=100,
        help_text=_(
            "The name of attribute"
        )
    )
    value = models.TextField(
        null=True, default=True,
        help_text=_(
            "The value of attribute"
        )
    )


class AbstractDashboardIndicatorLayerObject(models.Model):
    """Abstract for indicator layer object."""

    object = models.ForeignKey(
        DashboardIndicatorLayer,
        on_delete=models.CASCADE
    )
    order = models.IntegerField(
        default=0
    )
    name = models.CharField(
        max_length=512,
        blank=True, null=True
    )
    color = models.CharField(
        max_length=16,
        default='#000000',
        blank=True, null=True
    )

    class Meta:  # noqa: D106
        abstract = True


# TODO:
#  IndicatorStyleBaseModel is deprecated
class DashboardIndicatorLayerRelatedTable(
    AbstractDashboardIndicatorLayerObject, IndicatorStyleBaseModel
):
    """RelatedTable x Dashboard model."""

    related_table = models.ForeignKey(
        RelatedTable,
        on_delete=models.CASCADE
    )

    class Meta:  # noqa: D106
        ordering = ('order',)


# Contains indicator layer
class DashboardIndicatorLayerIndicator(
    AbstractDashboardIndicatorLayerObject, IndicatorStyleBaseModel
):
    """Indicator Layer x Dashboard model."""

    indicator = models.ForeignKey(
        Indicator,
        on_delete=models.CASCADE
    )
    override_style = models.BooleanField(default=False)

    @property
    def is_using_obj_style(self):
        """If using obj style."""
        return self.indicator.type == TYPE_DYNAMIC_INDICATOR

    @property
    def rules(self):
        """Return query rules."""
        return self.dashboardindicatorlayerindicatorrule_set.all()

    class Meta:  # noqa: D106
        ordering = ('order',)


class DashboardIndicatorLayerIndicatorRule(RuleModel):
    """DashboardIndicatorLayerIndicator x Rule."""

    object = models.ForeignKey(
        DashboardIndicatorLayerIndicator,
        on_delete=models.CASCADE
    )

    class Meta:  # noqa: D106
        unique_together = ('object', 'name')
        ordering = ('order',)
