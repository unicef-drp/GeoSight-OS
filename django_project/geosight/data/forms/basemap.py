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

from geosight.data.models.basemap_layer import BasemapLayer, BasemapGroup


class BasemapForm(forms.ModelForm):
    """Basemap form."""

    group = forms.ChoiceField(
        label='Category',
        widget=forms.Select(
            attrs={'data-autocreated': 'True'}
        )
    )

    def __init__(self, *args, **kwargs):
        """Init."""
        super().__init__(*args, **kwargs)
        self.fields['group'].choices = [
            (group.name, group.name)
            for group in BasemapGroup.objects.all().order_by('name')
        ]

        try:
            if self.data['group']:
                self.fields['group'].choices += [
                    (self.data['group'], self.data['group'])
                ]
        except KeyError:
            pass

    def clean_group(self):
        """Return group."""
        group, created = BasemapGroup.objects.get_or_create(
            name=self.cleaned_data['group']
        )
        return group

    class Meta:  # noqa: D106
        model = BasemapLayer
        exclude = ('created_at', 'creator', 'modified_at')

    @staticmethod
    def model_to_initial(model: BasemapLayer):
        """Return model data as json."""
        initial = model_to_dict(model)
        try:
            initial['group'] = BasemapGroup.objects.get(
                id=initial['group']
            ).name
        except BasemapGroup.DoesNotExist:
            initial['group'] = None
        return initial
