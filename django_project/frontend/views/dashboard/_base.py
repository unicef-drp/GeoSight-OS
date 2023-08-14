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

import json
from abc import ABC

from frontend.views._base import BaseView
from geosight.data.models.code import CodeList
from geosight.data.models.dashboard import DashboardGroup
from geosight.data.models.dashboard.widget import LayerUsed
from geosight.data.models.indicator import (
    IndicatorTypeChoices
)
from geosight.data.models.style.indicator_style import (
    IndicatorStyleTypeChoices
)
from geosight.data.serializer.code import CodeListSerializer


class BaseDashboardView(ABC, BaseView):
    """Base dashboard View."""

    instance = None
    template_name = 'frontend/dashboard.html'

    def get_context_data(self, **kwargs) -> dict:
        """Return context data."""
        context = super().get_context_data(**kwargs)

        context['definition'] = {
            'WidgetLayerUsed': {
                name: value for name, value in vars(LayerUsed).items() if
                name.isupper()
            },
        }
        context['codelists'] = json.dumps(
            CodeListSerializer(CodeList.objects.all(), many=True).data
        )
        context['types'] = json.dumps(IndicatorTypeChoices)
        context['categories'] = json.dumps(
            list(
                DashboardGroup.objects.exclude(name='').order_by(
                    'name').values_list(
                    'name', flat=True)
            )
        )
        context['styleTypes'] = json.dumps(IndicatorStyleTypeChoices)
        return context

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Project'

    @property
    def content_title(self):
        """Return content title that used on page title indicator."""
        raise NotImplementedError
