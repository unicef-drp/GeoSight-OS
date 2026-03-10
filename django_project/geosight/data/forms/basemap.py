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

from core.models.general import BASE_VERSIONED_RESOURCE_FIELDS
from geosight.data.models.basemap_layer import BasemapLayer, BasemapGroup


class BasemapForm(forms.ModelForm):
    """Form for creating and editing a basemap layer.

    Provides a category (group) field populated from existing
    :class:`BasemapGroup` objects, with support for auto-creating
    new groups on save.
    """

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
        """Resolve the group name to a :class:`BasemapGroup` instance.

        Creates the group if it does not already exist.

        :return: The resolved or newly created group.
        :rtype: BasemapGroup
        """
        group, created = BasemapGroup.objects.get_or_create(
            name=self.cleaned_data['group']
        )
        return group

    class Meta:  # noqa: D106
        model = BasemapLayer
        exclude = BASE_VERSIONED_RESOURCE_FIELDS

    @staticmethod
    def model_to_initial(model: BasemapLayer):
        """Return model data as a dictionary suitable for form initialisation.

        Resolves the group foreign key to its name string.

        :param model: The basemap layer instance to convert.
        :type model: BasemapLayer
        :return: A dictionary of field values for the form.
        :rtype: dict
        """
        initial = model_to_dict(model)
        try:
            initial['group'] = BasemapGroup.objects.get(
                id=initial['group']
            ).name
        except BasemapGroup.DoesNotExist:
            initial['group'] = None
        return initial


# TODO:
#  Duplicated with above form.
#  Need to rename group to category.
#  Change all "group" to category.
class BasemapFormAPI(forms.ModelForm):
    """API form for creating and editing a basemap layer.

    Uses a ``category`` field (mapped internally to ``group``) populated
    from existing :class:`BasemapGroup` objects.
    """

    category = forms.CharField(
        label='Category',
        widget=forms.Select(
            attrs={'data-autocreated': 'True'}
        )
    )

    def __init__(self, *args, **kwargs):  # noqa: DOC101, DOC103
        """Initialise the form and populate category choices.

        :param args: Positional arguments passed to the parent form.
        :param kwargs: Keyword arguments passed to the parent form.
        """
        super().__init__(*args, **kwargs)
        self.fields['category'].choices = [
            (group.name, group.name)
            for group in BasemapGroup.objects.all().order_by('name')
        ]

        try:
            if self.data['category']:
                self.fields['category'].choices += [
                    (self.data['category'], self.data['category'])
                ]
        except KeyError:
            pass

    def clean_category(self):
        """Resolve the category name to a :class:`BasemapGroup` instance.

        Creates the group if it does not already exist.

        :return: The resolved or newly created group.
        :rtype: BasemapGroup
        """
        group, created = BasemapGroup.objects.get_or_create(
            name=self.cleaned_data['category']
        )
        return group

    def save(self, commit=True):
        """Save the form, mapping category back to the group field.

        :param commit: Whether to persist the instance to the database.
        :type commit: bool
        :return: The saved or unsaved basemap layer instance.
        :rtype: BasemapLayer
        """
        instance = super(BasemapFormAPI, self).save(commit=False)
        instance.group = self.cleaned_data['category']
        if commit:
            instance.save()
        return instance

    class Meta:  # noqa: D106
        model = BasemapLayer
        exclude = BASE_VERSIONED_RESOURCE_FIELDS + ('group',)
