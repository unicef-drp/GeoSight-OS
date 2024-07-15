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
__date__ = '12/07/2024'
__copyright__ = ('Copyright 2023, Unicef')

from django import forms
from django.forms.models import model_to_dict

from geosight.cloud_native_gis.models import CloudNativeGISLayer


class CloudNativeGISLayerForm(forms.ModelForm):
    """CloudNativeGISLayer form."""

    class Meta:  # noqa: D106
        model = CloudNativeGISLayer
        fields = ('name', 'description', 'attribution')

    @staticmethod
    def model_to_initial(model: CloudNativeGISLayer):
        """Return model data as json."""
        return model_to_dict(model)
