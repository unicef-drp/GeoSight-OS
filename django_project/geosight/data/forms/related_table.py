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
__date__ = '31/01/2024'
__copyright__ = ('Copyright 2023, Unicef')

import json

from django import forms
from django.forms.models import model_to_dict

from geosight.data.models.related_table import RelatedTable


class RelatedTableForm(forms.ModelForm):
    """RelatedTable form."""

    data_fields = forms.CharField(
        required=False,
        widget=forms.HiddenInput()
    )

    class Meta:  # noqa: D106
        model = RelatedTable
        exclude = ('created_at', 'creator', 'modified_at')

    @staticmethod
    def model_to_initial(model: RelatedTable):
        """Return model data as json."""
        initial = model_to_dict(model)
        initial['data_fields'] = json.dumps(model.fields_definition)
        return initial
