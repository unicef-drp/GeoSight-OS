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
__date__ = '20/11/2023'
__copyright__ = ('Copyright 2023, Unicef')

from django import forms
from django.core import signing

from geosight.data.models.arcgis import ArcgisConfig


class ArcgisConfigForm(forms.ModelForm):
    """ArcgisConfig form."""

    class Meta:  # noqa: D106
        model = ArcgisConfig
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        """Init data."""
        if 'instance' in kwargs and kwargs['instance']:
            config = kwargs['instance']
            initial = {
                'password': config.password_val,
                'token': config.token_val,
            }
            kwargs['initial'] = initial
        super(ArcgisConfigForm, self).__init__(*args, **kwargs)

    def clean_password(self):
        """Clean password."""
        password = self.cleaned_data['password']
        if password:
            return signing.dumps(password)
        else:
            return ''

    def clean(self):
        """Clean form."""
        cleaned_data = super().clean()
        generate_token_url = cleaned_data['generate_token_url']
        username = cleaned_data['username']
        password = signing.loads(cleaned_data['password'])
        try:
            ArcgisConfig.request_generate_token(
                generate_token_url, username, password
            )
        except Exception as e:
            self.add_error("generate_token_url", f'{e}')
