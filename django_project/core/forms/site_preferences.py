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
__date__ = '29/08/2023'
__copyright__ = ('Copyright 2023, Unicef')

from django import forms
from django.core import signing

from core.models.preferences import SitePreferences


class SitePreferencesForm(forms.ModelForm):
    """SitePreferences form."""

    class Meta:  # noqa: D106
        model = SitePreferences
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        """Init data."""
        if 'instance' in kwargs:
            pref = kwargs['instance']
            initial = {
                'georepo_api_key_level_1': pref.georepo_api_key_level_1_val,
                'georepo_api_key_level_4': pref.georepo_api_key_level_4_val
            }
            kwargs['initial'] = initial
        super(SitePreferencesForm, self).__init__(*args, **kwargs)

    def clean_georepo_api_key_level_1(self):
        """Clean georepo api key."""
        georepo_api_key = self.cleaned_data['georepo_api_key_level_1']
        if georepo_api_key:
            return signing.dumps(georepo_api_key)
        else:
            return ''

    def clean_georepo_api_key_level_4(self):
        """Clean georepo api key."""
        georepo_api_key = self.cleaned_data['georepo_api_key_level_4']
        if georepo_api_key:
            return signing.dumps(georepo_api_key)
        else:
            return ''
