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

from core.models.preferences import SitePreferences
from geosight.data.models.style.base import Style, StyleType


class BaseStyleForm(forms.ModelForm):
    """Base style form."""

    def clean_style_config(self):
        """Return style_config."""
        preferences = SitePreferences.preferences()
        if self.data.get('style_type', None) in [
            StyleType.DYNAMIC_QUALITATIVE, StyleType.DYNAMIC_QUANTITATIVE
        ]:
            color_palette = self.data.get('color_palette', None)
            color_palette_reverse = self.data.get(
                'color_palette_reverse', False
            )
            dynamic_classification = self.data.get(
                'dynamic_classification', None)
            dynamic_class_num = self.data.get(
                'dynamic_class_num', 2
            )
            if isinstance(color_palette, str):
                color_palette = int(color_palette)
            return {
                'color_palette': color_palette,
                'color_palette_reverse': color_palette_reverse,
                'dynamic_classification': dynamic_classification,
                'dynamic_class_num': dynamic_class_num,
                'sync_outline': self.data.get('sync_outline', False),
                'sync_filter': self.data.get('sync_filter', False),
                'outline_color': self.data.get(
                    'outline_color',
                    preferences.style_dynamic_style_outline_color
                ),
                'outline_size': self.data.get(
                    'outline_size',
                    preferences.style_dynamic_style_outline_size
                ),
                'no_data_rule': {
                    "name": self.data.get(
                        'dynamic_node_data_rule_name_0', 'No data'
                    ),
                    "rule": self.data.get(
                        'dynamic_node_data_rule_rule_0', 'No data'
                    ),
                    "color": self.data.get(
                        'dynamic_node_data_rule_color_0',
                        preferences.style_no_data_fill_color
                    ),
                    "outline_color": self.data.get(
                        'dynamic_node_data_rule_outline_color_0',
                        preferences.style_no_data_outline_color
                    ),
                    "outline_size": self.data.get(
                        'dynamic_node_data_rule_outline_size_0',
                        preferences.style_no_data_outline_size
                    ),
                    "active": self.data.get(
                        'dynamic_node_data_rule_active_0', False
                    ),
                }
            }
        return {}


class StyleForm(BaseStyleForm):
    """Style form."""

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
            (group, group)
            for group in list(
                set(
                    Style.objects.filter(
                        group__isnull=False
                    ).values_list('group', flat=True)
                )
            )
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
        return self.cleaned_data['group']

    class Meta:  # noqa: D106
        model = Style
        fields = (
            'name', 'description', 'group', 'value_type', 'style_type',
            'style_config'
        )

    @staticmethod
    def model_to_initial(model: Style):
        """Return model data as json."""
        data = model_to_dict(model)
        try:
            del data['created_at']
        except KeyError:
            pass
        return data
