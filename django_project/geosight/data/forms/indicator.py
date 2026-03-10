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

from core.models.general import BASE_VERSIONED_RESOURCE_FIELDS
from geosight.data.forms.style import BaseStyleForm
from geosight.data.models.indicator import Indicator, IndicatorGroup
from geosight.data.models.style.base import Style
from geosight.data.models.style.indicator_style import IndicatorStyleType
from geosight.data.serializer.style import StyleSerializer


class IndicatorForm(BaseStyleForm):
    """Form for creating and editing an indicator.

    Provides a category (group) field populated from existing
    :class:`IndicatorGroup` objects, with validation for name uniqueness
    within a category and shortcode uniqueness across all indicators.
    """

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

    def __init__(self, *args, **kwargs):  # noqa: DOC101, DOC103
        """Initialise the form and populate group choices.

        :param args: Positional arguments passed to the parent form.
        :param kwargs: Keyword arguments passed to the parent form.
        """
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
        exclude = BASE_VERSIONED_RESOURCE_FIELDS + (
            'order', 'geometry_reporting_units',
            'instance', 'show_in_context_analysis', 'version_data'
        )

    def clean_name(self):
        """Validate that the name is unique within its category.

        :raises ValidationError: If an indicator with the same name already
            exists in the same category.
        :return: The validated name.
        :rtype: str
        """
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
        """Resolve the group name to an :class:`IndicatorGroup` instance.

        Creates the group if it does not already exist.

        :return: The resolved or newly created indicator group.
        :rtype: IndicatorGroup
        """
        group = self.cleaned_data['group']
        indicator_group, created = IndicatorGroup.objects.get_or_create(
            name=group
        )
        return indicator_group

    def clean_shortcode(self):
        """Validate that the shortcode is unique across all indicators.

        :raises ValidationError: If the shortcode is already used by another
            indicator.
        :return: The validated shortcode.
        :rtype: str
        """
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
        """Return the validated minimum value.

        :return: The cleaned minimum value.
        :rtype: float or None
        """
        min_value = self.cleaned_data['min_value']
        return min_value

    def clean_max_value(self):
        """Validate that max value is not less than min value.

        :raises ValidationError: If max value is less than min value.
        :return: The validated maximum value.
        :rtype: float or None
        """
        min_value = self.cleaned_data['min_value']
        max_value = self.cleaned_data['max_value']
        if min_value is not None and max_value is not None:
            if min_value > max_value:
                raise ValidationError("Max value is less than min value")
        return max_value

    @staticmethod
    def model_to_initial(indicator: Indicator):
        """Return model data as a dictionary suitable for form initialisation.

        Resolves the group foreign key to its name string and populates
        style data based on the indicator's style type.

        :param indicator: The indicator instance to convert.
        :type indicator: Indicator
        :return: A dictionary of field values for the form.
        :rtype: dict
        """
        initial = model_to_dict(indicator)
        del initial['created_at']
        del initial['version_data']
        try:
            initial['group'] = IndicatorGroup.objects.get(
                id=initial['group']
            ).name
        except IndicatorGroup.DoesNotExist:
            initial['group'] = None
        try:
            if indicator.style_type == IndicatorStyleType.LIBRARY:
                initial['style_data'] = StyleSerializer(
                    Style.objects.get(id=initial['style'])
                ).data
            else:
                initial['style'] = indicator.style_obj(None)
                initial['style_data'] = None
        except Style.DoesNotExist:
            initial['style_data'] = None
        return initial
