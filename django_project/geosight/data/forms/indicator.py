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
from django.core.exceptions import ValidationError
from django.forms.models import model_to_dict

from geosight.data.forms.style import BaseStyleForm
from geosight.data.models.indicator import Indicator, IndicatorGroup
from geosight.data.models.style.base import Style
from geosight.data.serializer.style import StyleSerializer


class IndicatorForm(BaseStyleForm):
    """Indicator form."""

    label_suffix = ""

    shortcode = forms.CharField(
        required=True, help_text=Indicator.shortcode_helptext
    )

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
            for group in IndicatorGroup.objects.all().order_by('name')
        ]

        try:
            if self.data['group']:
                self.fields['group'].choices += [
                    (self.data['group'], self.data['group'])
                ]
        except KeyError:
            pass

    class Meta:  # noqa: D106
        model = Indicator
        exclude = (
            'created_at', 'creator', 'modified_at',
            'order', 'geometry_reporting_units',
            'instance', 'show_in_context_analysis'
        )

    def clean_name(self):
        """Return group."""
        name = self.cleaned_data['name']
        group = self.data['group']
        indicators = Indicator.objects.exclude(
            id=self.instance.id
        ).filter(name=name, group__name=group)
        if indicators.count():
            raise ValidationError(
                f"The name `{name}` is already exist for category `{group}`."
            )
        return name

    def clean_group(self):
        """Return group."""
        group = self.cleaned_data['group']
        indicator_group, created = IndicatorGroup.objects.get_or_create(
            name=group
        )
        return indicator_group

    def clean_shortcode(self):
        """Return shortcode."""
        shortcode = self.cleaned_data['shortcode']
        try:
            indicator = Indicator.objects.exclude(
                id=self.instance.id
            ).get(shortcode=shortcode)
            raise ValidationError(
                f"The shortcode has been used by {indicator.name}"
            )
        except Indicator.DoesNotExist:
            return shortcode

    def clean_min_value(self):
        """Return max_value."""
        min_value = self.cleaned_data['min_value']
        return min_value

    def clean_max_value(self):
        """Return max_value."""
        min_value = self.cleaned_data['min_value']
        max_value = self.cleaned_data['max_value']
        if min_value is not None and max_value is not None:
            if min_value > max_value:
                raise ValidationError("Max value is less than min value")
        return max_value

    @staticmethod
    def model_to_initial(indicator: Indicator):
        """Return model data as json."""
        initial = model_to_dict(indicator)
        del initial['created_at']
        try:
            initial['group'] = IndicatorGroup.objects.get(
                id=initial['group']
            ).name
        except IndicatorGroup.DoesNotExist:
            initial['group'] = None
        try:
            initial['style_data'] = StyleSerializer(
                Style.objects.get(id=initial['style'])
            ).data
        except Style.DoesNotExist:
            initial['style_data'] = None
        return initial
