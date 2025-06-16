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
    def update_data(data, dashboard: Dashboard):  # noqa DOC503
        """
        Normalize and validate dashboard POST data before saving.

        This method updates and prepares raw input data by:
        - Attaching the dashboard ID.
        - Converting the bounding box (`extent`) to
            a PostGIS Polygon with SRID 4326.
        - Serializing filters to JSON string.
        - Resolving foreign key references
            (e.g., `selected_basemap`, `selected_context_layers`).
        - Ensuring `transparency_config` exists with default values if missing.

        :param data: Raw dashboard data from POST request.
        :type data: dict
        :param dashboard: Dashboard instance to associate the data with.
        :type dashboard: Dashboard
        :return:
            The cleaned and updated data dictionary ready for model saving.
        :rtype: dict
        :raises ValueError:
            If `selected_basemap` or any `selected_context_layers` are invalid.
        """
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
