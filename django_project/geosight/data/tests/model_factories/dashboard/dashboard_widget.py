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
__date__ = '19/08/2024'
__copyright__ = ('Copyright 2023, Unicef')

import factory

from geosight.data.models.dashboard.dashboard_widget import (
    DashboardWidget
)
from geosight.data.tests.model_factories.dashboard.dashboard import DashboardF


class DashboardWidgetF(factory.django.DjangoModelFactory):
    """Factory for DashboardWidget."""

    dashboard = factory.SubFactory(DashboardF)
    type = factory.Sequence(
        lambda n: 'type {}'.format(n)
    )
    config = {}

    class Meta:  # noqa: D106
        model = DashboardWidget
