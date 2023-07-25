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

from core.models import AbstractTerm, AbstractEditData
from geosight.data.models.indicator.indicator_type import (
    IndicatorType, IndicatorTypeChoices
)
from geosight.data.models.rule import RuleModel
from geosight.permission.models.manager import PermissionManager


# STYLE TYPE
class StyleType(object):
    """Type of style."""

    PREDEFINED = 'Predefined style/color rules.'
    DYNAMIC_QUANTITATIVE = 'Dynamic quantitative style.'
    DYNAMIC_QUALITATIVE = 'Dynamic qualitative style.'


StyleTypeChoices = (
    (StyleType.PREDEFINED, StyleType.PREDEFINED),
    (StyleType.DYNAMIC_QUANTITATIVE, StyleType.DYNAMIC_QUANTITATIVE),
    (StyleType.DYNAMIC_QUALITATIVE, StyleType.DYNAMIC_QUALITATIVE),
)


# DYNAMIC CLASSIFICATION
class DynamicClassificationType(object):
    """Type of style."""

    NATURAL_BREAKS = 'Natural breaks.'
    EQUIDISTANT = 'Equidistant.'
    QUANTILE = 'Quantile.'
    STD_DEFIATION = 'Std deviation.'
    ARITHMETIC_PROGRESSION = 'Arithmetic progression.'
    GEOMETRIC_PROGRESSION = 'Geometric progression.'


DynamicClassificationTypeChoices = (
    (
        DynamicClassificationType.NATURAL_BREAKS,
        DynamicClassificationType.NATURAL_BREAKS
    ),
    (
        DynamicClassificationType.EQUIDISTANT,
        DynamicClassificationType.EQUIDISTANT
    ),
    (
        DynamicClassificationType.QUANTILE,
        DynamicClassificationType.QUANTILE
    ),
    (
        DynamicClassificationType.STD_DEFIATION,
        DynamicClassificationType.STD_DEFIATION
    ),
    (
        DynamicClassificationType.ARITHMETIC_PROGRESSION,
        DynamicClassificationType.ARITHMETIC_PROGRESSION
    ),
    (
        DynamicClassificationType.GEOMETRIC_PROGRESSION,
        DynamicClassificationType.GEOMETRIC_PROGRESSION
    ),
)


class Style(AbstractTerm, AbstractEditData):
    """Collection of style rule."""

    name = models.CharField(max_length=512, unique=True)
    group = models.CharField(max_length=512, null=True, blank=True)
    style_type = models.CharField(
        max_length=256,
        default=StyleType.PREDEFINED,
        choices=StyleTypeChoices
    )
    style_config = models.JSONField(
        null=True, blank=True
    )

    # Value control
    value_type = models.CharField(
        max_length=256,
        default=IndicatorType.FLOAT,
        choices=IndicatorTypeChoices
    )
    objects = models.Manager()
    permissions = PermissionManager()

    class Meta:  # noqa: D106
        ordering = ('name',)

    def rules_dict(self):
        """Return rules in list of dict."""
        from geosight.data.serializer.style import StyleRuleSerializer
        return [
            dict(rule) for rule in StyleRuleSerializer(
                self.stylerule_set.all(), many=True
            ).data
        ]


class StyleRule(RuleModel):
    """Style rule."""

    style = models.ForeignKey(Style, on_delete=models.CASCADE)
