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

from django import forms
from django.contrib.gis.geos import Polygon

from geosight.data.models.basemap_layer import BasemapLayer
from geosight.data.models.context_layer import ContextLayer
from geosight.data.models.dashboard import (
    Dashboard, DashboardBookmark
)


class DashboardBookmarkForm(forms.ModelForm):
    """DashboardBookmark form."""

    class Meta:  # noqa: D106
        model = DashboardBookmark
        fields = '__all__'

    @staticmethod
    def update_data(data, dashboard: Dashboard):
        """Update data from POST data."""
        data['dashboard'] = dashboard.id

        # save polygon
        poly = Polygon.from_bbox(data['extent'])
        poly.srid = 4326
        data['extent'] = poly
        data['filters'] = json.dumps(data['filters'])

        # Check other foreign key
        try:
            data['selected_basemap'] = BasemapLayer.objects.get(
                id=data['selected_basemap']
            )
        except BasemapLayer.DoesNotExist:
            raise ValueError(f'{data["selected_basemap"]} does not exist')

        try:
            for row in data['selected_context_layers']:
                ContextLayer.objects.get(id=row)
        except ContextLayer.DoesNotExist:
            raise ValueError('Context layer does not exist')

        # Transparency
        try:
            if not data['transparency_config']:
                raise KeyError
        except KeyError:
            data['transparency_config'] = {
                'indicatorLayer': 100,
                'contextLayer': 100,
            }
        return data
