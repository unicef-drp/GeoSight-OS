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

from geosight.data.models.style.base import (
    Style, StyleType, StyleTypeChoices
)
from geosight.data.serializer.style import StyleRuleSerializer


# INDICATOR STYLE TYPE
class IndicatorStyleType(StyleType):
    """Style type that will be used by indicator."""

    LIBRARY = 'Style from library.'


IndicatorStyleTypeChoices = StyleTypeChoices + (
    (IndicatorStyleType.LIBRARY, IndicatorStyleType.LIBRARY),
)


class IndicatorStyleBaseModel(models.Model):
    """Style type that will be used by indicator."""

    style_type = models.CharField(
        max_length=256,
        default=IndicatorStyleType.LIBRARY,
        choices=IndicatorStyleTypeChoices
    )
    style = models.ForeignKey(
        Style, null=True, blank=True,
        on_delete=models.SET_NULL
    )
    style_config = models.JSONField(
        null=True, blank=True
    )

    # Label style control
    label_config = models.JSONField(
        null=True, blank=True
    )

    class Meta:  # noqa: D106
        abstract = True

    @property
    def rules(self):
        """Return query rules."""
        raise NotImplemented()

    def style_obj(self, user):
        """Return object style."""
        from geosight.data.serializer.dashboard_indicator_layer import (
            DashboardIndicatorLayerRuleSerializer
        )
        if self.style_type == IndicatorStyleType.LIBRARY and self.style:
            if self.style.permission.has_read_data_perm(user):
                return StyleRuleSerializer(
                    self.style.stylerule_set.all(), many=True
                ).data
            return []
        else:
            return DashboardIndicatorLayerRuleSerializer(
                self.rules.all(), many=True
            ).data
        return None
