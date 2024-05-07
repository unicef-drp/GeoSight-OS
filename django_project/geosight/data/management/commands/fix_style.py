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

from django.core.management.base import BaseCommand

from geosight.data.models.dashboard.dashboard_indicator_layer import (
    TYPE_SINGLE_INDICATOR,
    TYPE_MULTI_INDICATOR,
    TYPE_RELATED_TABLE,
    DashboardIndicatorLayer,
    DashboardIndicatorLayerRule
)


class Command(BaseCommand):
    """Update all _fixtures."""

    def handle(self, *args, **options):
        """Command handler."""
        for layer in DashboardIndicatorLayer.objects.all():
            if layer.dashboardindicatorlayerindicator_set.count() > 1:
                layer.type = TYPE_MULTI_INDICATOR
            elif layer.dashboardindicatorlayerindicator_set.count() == 1:
                layer.type = TYPE_SINGLE_INDICATOR
            else:
                layer.type = TYPE_RELATED_TABLE
            layer.save()

        for layer in DashboardIndicatorLayer.objects.all():
            # Style for related table
            for rt in layer.dashboardindicatorlayerrelatedtable_set.all():
                layer.style_type = rt.style_type
                layer.style_id = rt.style_id
                layer.label_config = rt.label_config
                layer.override_style = False
                layer.override_label = False
                layer.save()
                for row in \
                        rt.dashboardindicatorlayerrelatedtablerule_set.all():
                    DashboardIndicatorLayerRule.objects.get_or_create(
                        object=layer,
                        name=row.name,
                        rule=row.rule,
                        color=row.color,
                        outline_color=row.outline_color,
                        order=row.order,
                        active=row.active
                    )
