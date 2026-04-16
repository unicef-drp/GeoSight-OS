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
from geosight.data.models.style.base import (
    Style, StyleType, DynamicClassificationTypeChoices
)

DYNAMIC_CLASSIFICATION_CHOICES = [
    choice[0] for choice in DynamicClassificationTypeChoices
]


class BaseStyleForm(forms.ModelForm):
    """Base form for models that carry a ``style_config`` field.

    Handles the ``style_config`` field validation and construction
    depending on the selected ``style_type``:

    - **Dynamic styles** (``DYNAMIC_QUALITATIVE`` or
      ``DYNAMIC_QUANTITATIVE``): ``style_config`` is built from
      individual form fields submitted alongside the payload —
      ``color_palette``, ``color_palette_reverse``,
      ``dynamic_classification``, ``dynamic_class_num``,
      ``sync_outline``, ``sync_filter``, ``outline_color``,
      ``outline_size``, and a ``no_data_rule`` block assembled from
      ``dynamic_node_data_rule_*`` fields.  Missing values fall back
      to the site-wide defaults stored in
      :class:`~core.models.preferences.SitePreferences`.

      ``dynamic_classification`` must be one of
      :data:`DYNAMIC_CLASSIFICATION_CHOICES` or ``None``:
      ``"Equidistant."``, ``"Natural breaks."``, ``"Quantile."``,
      ``"Std deviation."``, ``"Arithmetic progression."``,
      ``"Geometric progression."``.

    - **All other style types**: ``style_config`` is preserved from
      the existing instance (or set to an empty dict for new objects).

    Subclasses (e.g. :class:`IndicatorForm`, :class:`StyleForm`) extend
    this form with model-specific fields and validation.
    """

    def clean_style_config(self):
        """Build and return the validated ``style_config`` dict.

        For dynamic style types (``DYNAMIC_QUALITATIVE`` or
        ``DYNAMIC_QUANTITATIVE``) with a ``color_palette`` provided,
        assembles the config from individual submitted fields, falling
        back to site-wide defaults from
        :class:`~core.models.preferences.SitePreferences` for any
        missing values.  For all other style types, returns the existing
        instance config or an empty dict for new objects.

        :return: Style configuration dictionary.
        :rtype: dict
        """
        preferences = SitePreferences.preferences()
        if self.data.get('style_type', None) in [
            StyleType.DYNAMIC_QUALITATIVE, StyleType.DYNAMIC_QUANTITATIVE
        ] and self.data.get('color_palette', None):
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
        if self.instance:
            return self.instance.style_config
        else:
            return {}


class StyleForm(BaseStyleForm):
    """Form for creating and editing a Style.

    Extends :class:`BaseStyleForm` with a ``group`` choice field populated
    from existing style group names.
    """

    group = forms.ChoiceField(
        label='Category',
        widget=forms.Select(
            attrs={'data-autocreated': 'True'}
        )
    )

    def __init__(self, *args, **kwargs):  # noqa: DOC101, DOC103
        """Initialise the form and populate group choices.

        Adds the submitted ``group`` value to the available choices so
        that new group names are accepted without a separate creation step.

        :param args: Positional arguments passed to the parent form.
        :param kwargs: Keyword arguments passed to the parent form.
        """
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
        """Return the validated group name.

        :return: The cleaned group name.
        :rtype: str
        """
        return self.cleaned_data['group']

    class Meta:  # noqa: D106
        model = Style
        fields = (
            'name', 'description', 'group', 'value_type', 'style_type',
            'style_config'
        )

    @staticmethod
    def model_to_initial(model: Style):
        """Return model data as a dictionary suitable for form initialisation.

        Removes ``created_at`` if present and ensures ``style_config``
        defaults to an empty dict when not set.

        :param model: The style instance to convert.
        :type model: Style
        :return: A dictionary of field values for the form.
        :rtype: dict
        """
        data = model_to_dict(model)
        try:
            del data['created_at']
        except KeyError:
            pass
        if not model.style_config:
            data['style_config'] = {}
        return data
