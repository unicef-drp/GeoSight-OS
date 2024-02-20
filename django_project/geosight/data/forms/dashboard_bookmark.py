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

from geosight.data.models.dashboard import DashboardBookmark


class DashboardBookmarkForm(forms.ModelForm):
    """DashboardBookmark form."""

    class Meta:  # noqa: D106
        model = DashboardBookmark
        fields = '__all__'

    @staticmethod
    def update_data(data):
        """Update data from POST data."""
        # save polygon
        poly = Polygon.from_bbox(data['extent'])
        poly.srid = 4326
        data['extent'] = poly
        data['filters'] = json.dumps(data['filters'])
        data['indicator_layer_show'] = data['indicatorShow']
        data['context_layer_show'] = data['contextLayersShow']
        data['selected_indicator_layers'] = data['selectedIndicatorLayers']
        data['selected_admin_level'] = data['selectedAdminLevel']
        data['is_3d_mode'] = data['is3dMode']
        data['position'] = json.loads(data['position'])
        return data
