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

from django import forms
from django.forms.models import model_to_dict

from geosight.importer.models.importer import Importer


class ImporterForm(forms.ModelForm):
    """Importer form."""

    run_on_create = forms.BooleanField(initial=True, required=False)

    def clean_run_on_create(self):
        """Return run_on_create."""
        return self.data.get('run_on_create', True)

    class Meta:  # noqa: D106
        model = Importer
        exclude = ('created_at',)

    @staticmethod
    def model_to_initial(indicator: Importer):
        """Return model data as json."""
        initial = model_to_dict(indicator)
        return initial
