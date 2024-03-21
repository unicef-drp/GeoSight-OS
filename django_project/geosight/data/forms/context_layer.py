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
from django.forms.models import model_to_dict

from geosight.data.models.context_layer import ContextLayer, ContextLayerGroup


class ContextLayerForm(forms.ModelForm):
    """ContextLayer form."""

    group = forms.ChoiceField(
        label='Category',
        widget=forms.Select(
            attrs={'data-autocreated': 'True'}
        )
    )

    data_fields = forms.CharField(
        required=False,
        widget=forms.HiddenInput()
    )

    styles = forms.CharField(
        required=False,
        widget=forms.HiddenInput()
    )

    label_styles = forms.CharField(
        required=False,
        widget=forms.HiddenInput()
    )

    longitude = forms.CharField(
        required=False,
        widget=forms.HiddenInput()
    )

    latitude = forms.CharField(
        required=False,
        widget=forms.HiddenInput()
    )

    datetime = forms.CharField(
        required=False,
        widget=forms.HiddenInput()
    )

    query = forms.CharField(
        required=False,
        widget=forms.HiddenInput()
    )

    def __init__(self, *args, **kwargs):
        """Init."""
        super().__init__(*args, **kwargs)
        self.fields['group'].choices = [
            (group.name, group.name)
            for group in ContextLayerGroup.objects.all().order_by('name')
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
        group, created = ContextLayerGroup.objects.get_or_create(
            name=self.cleaned_data['group']
        )
        return group

    def clean_styles(self):
        """Return styles."""
        if self.instance and not self.cleaned_data['styles']:
            return self.instance.styles
        try:
            if self.data['override_style']:
                return self.cleaned_data['styles']
        except KeyError:
            return None

    def clean_label_styles(self):
        """Return label_styles."""
        if self.instance and not self.cleaned_data['label_styles']:
            return self.instance.label_styles
        return self.cleaned_data['label_styles']

    class Meta:  # noqa: D106
        model = ContextLayer
        exclude = (
            'created_at', 'creator', 'modified_at'
        )

    @staticmethod
    def model_to_initial(model: ContextLayer):
        """Return model data as json."""
        from geosight.data.serializer.context_layer import (
            ContextLayerFieldSerializer
        )
        initial = model_to_dict(model)
        try:
            initial['group'] = ContextLayerGroup.objects.get(
                id=initial['group']
            ).name
        except ContextLayerGroup.DoesNotExist:
            initial['group'] = None
        try:
            initial['data_fields'] = json.dumps(
                ContextLayerFieldSerializer(
                    model.contextlayerfield_set.all(), many=True
                ).data
            )
        except ContextLayerGroup.DoesNotExist:
            initial['data_fields'] = ''
        return initial
