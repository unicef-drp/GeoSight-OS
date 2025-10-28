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

from geosight.data.models.related_table import RelatedTable, RelatedTableGroup


class RelatedTableForm(forms.ModelForm):
    """RelatedTable form."""

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

    def __init__(self, *args, **kwargs):  # noqa
        """Initialize the form."""
        try:
            args[0]['group'] = args[0]['category']
        except Exception:
            pass

        super().__init__(*args, **kwargs)
        self.fields['group'].choices = [
            (group.name, group.name)
            for group in RelatedTableGroup.objects.all().order_by('name')
        ]

        try:
            if self.data['group']:
                self.fields['group'].choices += [
                    (self.data['group'], self.data['group'])
                ]
        except KeyError:
            pass

    class Meta:  # noqa: D106
        model = RelatedTable
        exclude = (
            'created_at', 'creator', 'modified_at', 'modified_by',
            'version_data'
        )

    def clean_group(self):
        """Validate and return a :class:`RelatedTableGroup` instance.

        :return: The existing or newly created :class:`RelatedTableGroup`.
        :rtype: ContextLayerGroup
        """
        group, created = RelatedTableGroup.objects.get_or_create(
            name=self.cleaned_data['group']
        )
        return group

    @staticmethod
    def model_to_initial(model: RelatedTable):
        """Return model data as json."""
        initial = model_to_dict(model)
        initial['data_fields'] = json.dumps(model.fields_definition)
        initial['unique_id'] = str(model.unique_id)
        try:
            initial['group'] = RelatedTableGroup.objects.get(
                id=initial['group']
            ).name
        except RelatedTableGroup.DoesNotExist:
            initial['group'] = None
        return initial
