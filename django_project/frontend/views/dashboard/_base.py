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
from geosight.data.models.dashboard import DashboardGroup
from geosight.data.models.dashboard.dashboard_widget import LayerUsed
from geosight.data.models.indicator import (
    IndicatorTypeChoices
)


class BaseDashboardView(ABC, BaseView):
    """
    Base view for dashboards.

    Provides common context variables used by dashboard pages, such as
    indicator types, categories, and widget layer usage. This class should
    be extended by specific dashboard implementations.
    """

    instance = None
    template_name = 'frontend/dashboard.html'

    def get_context_data(self, **kwargs) -> dict:
        """
        Return context data for rendering the dashboard.

        The context includes:

        - ``definition``: A mapping of widget layers used.
        - ``types``: JSON-encoded list of indicator types.
        - ``categories``: JSON-encoded list of dashboard categories.

        :param dict **kwargs: Arbitrary keyword arguments passed from the view.
        :return: Context dictionary with dashboard-related variables.
        :rtype: dict
        """
        context = super().get_context_data(**kwargs)

        context['definition'] = {
            'WidgetLayerUsed': {
                name: value for name, value in vars(LayerUsed).items() if
                name.isupper()
            },
        }
        context['types'] = json.dumps(IndicatorTypeChoices)
        context['categories'] = json.dumps(
            list(
                DashboardGroup.objects.exclude(name='').order_by(
                    'name').values_list(
                    'name', flat=True)
            )
        )
        return context

    @property
    def page_title(self):
        """
        Return the page title to be displayed on the browser tab.

        :return: Page title string.
        :rtype: str
        """
        return 'Project'

    @property
    def content_title(self):
        """
        Return the content title used as the page heading.

        Must be implemented in subclasses.

        :raises NotImplementedError:
            This property must be overridden in subclasses.
        """
        raise NotImplementedError
