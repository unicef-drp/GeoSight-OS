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

from geosight.reference_dataset.models.reference_dataset import (
    ReferenceDataset
)


class ReferenceDatasetForm(forms.ModelForm):
    """ReferenceDatasetForm form."""

    def clean_name(self):
        """
        Validate that the name is unique among ReferenceDataset instances.

        Checks if any other `ReferenceDataset` objects
        (excluding the current instance) already have the same name.
        Raises a `ValidationError` if a duplicate is found.

        :raises ValidationError: If the name already exists in another dataset.
        :return: The validated unique name.
        :rtype: str
        """
        name = self.cleaned_data['name']
        views = ReferenceDataset.objects.exclude(
            id=self.instance.id
        ).filter(name=name)
        if views.count():
            raise ValidationError(
                f"The View with name `{name}` is already exist."
            )
        return name

    def save(self, commit=True):
        """
        Save the form data to create or update a `ReferenceDataset` instance.

        If the instance does not have an identifier,
        generate a UUID and assign it.
        Sets `in_georepo` to `False` before saving.

        :param commit:
            Whether to commit the save operation to the database immediately.
            Defaults to `True`.
        :type commit: bool, optional
        :return: The saved or unsaved `ReferenceDataset` instance.
        :rtype: ReferenceDataset
        """
        instance = super(ReferenceDatasetForm, self).save(commit=False)
        if not instance.identifier:
            instance.identifier = ReferenceDataset.get_uuid()
        instance.in_georepo = False
        if commit:
            instance.save()
        return instance

    class Meta:  # noqa: D106
        model = ReferenceDataset
        exclude = (
            'created_at', 'creator', 'modified_at', 'modified_by',
            'version_data', 'identifier', 'in_georepo', 'countries',
            'tags'
        )

    @staticmethod
    def model_to_initial(model: ReferenceDataset):
        """
        Convert a ReferenceDataset model instance to a dictionary.

        This method serializes the given `model` instance into a dictionary
        representation suitable for JSON serialization or form initialization.

        :param model: An instance of `ReferenceDataset` to serialize.
        :type model: ReferenceDataset
        :return: A dictionary representation of the model's fields and values.
        :rtype: dict
        """
        return model_to_dict(model)
