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

from django.contrib.auth import get_user_model
from django.contrib.gis.db import models

from core.models.general import AbstractTerm
from geosight.data.models.basemap_layer import BasemapLayer
from geosight.data.models.context_layer import ContextLayer
from geosight.data.models.dashboard import Dashboard
from geosight.data.models.field_layer import FieldLayerAbstract
from geosight.data.models.indicator import Indicator
from geosight.data.models.rule import RuleModel
from geosight.data.models.style.indicator_style import IndicatorStyleBaseModel

User = get_user_model()


class DashboardRelationGroup(AbstractTerm):
    """Relation group for dashboard relation data."""

    group = models.ForeignKey(
        'geosight_data.DashboardRelationGroup',
        null=True,
        blank=True,
        on_delete=models.CASCADE
    )
    order = models.IntegerField(
        default=0
    )

    def __str__(self):
        return self.name


class DashboardRelation(models.Model):
    """Abstract Dashboard Relation.

    This has:
    - dashboard
    - order
    - visible_by_default
    """

    dashboard = models.ForeignKey(
        Dashboard,
        on_delete=models.CASCADE
    )
    order = models.IntegerField(
        default=0
    )
    visible_by_default = models.BooleanField(
        default=False
    )
    group = models.CharField(
        max_length=512,
        blank=True, null=True
    )
    relation_group = models.ForeignKey(
        'geosight_data.DashboardRelationGroup',
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )

    class Meta:  # noqa: D106
        abstract = True


class DashboardIndicator(IndicatorStyleBaseModel, DashboardRelation):
    """Indicator x Dashboard model."""

    object = models.ForeignKey(
        Indicator,
        on_delete=models.CASCADE
    )
    override_style = models.BooleanField(default=False)
    override_label = models.BooleanField(default=False)

    class Meta:  # noqa: D106
        ordering = ('object__name',)

    @property
    def rules(self):
        """Return query rules."""
        return self.dashboardindicatorrule_set.all()


class DashboardIndicatorRule(RuleModel):
    """Indicator x Dashboard rule."""

    object = models.ForeignKey(
        DashboardIndicator,
        on_delete=models.CASCADE
    )

    class Meta:  # noqa: D106
        unique_together = ('object', 'name')
        ordering = ('order',)


class DashboardBasemap(DashboardRelation):
    """Indicator x Basemap model."""

    object = models.ForeignKey(
        BasemapLayer,
        on_delete=models.CASCADE
    )

    class Meta:  # noqa: D106
        ordering = ('order',)


class DashboardContextLayer(DashboardRelation):
    """Indicator x ContextLayer model."""

    object = models.ForeignKey(
        ContextLayer,
        on_delete=models.CASCADE
    )
    styles = models.TextField(
        null=True, blank=True
    )
    label_styles = models.TextField(
        null=True, blank=True
    )
    override_style = models.BooleanField(default=False)
    override_field = models.BooleanField(default=False)
    override_label = models.BooleanField(default=False)
    configuration = models.JSONField(
        null=True, blank=True
    )

    class Meta:  # noqa: D106
        ordering = ('order',)


class DashboardContextLayerField(FieldLayerAbstract):
    """Indicator x Dashboard rule."""

    object = models.ForeignKey(
        DashboardContextLayer,
        on_delete=models.CASCADE
    )

    class Meta:  # noqa: D106
        unique_together = ('object', 'name')
