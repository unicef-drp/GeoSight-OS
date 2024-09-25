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
        """Return name."""
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
        """Save form."""
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
            'created_at', 'creator', 'modified_at', 'version_data',
            'identifier', 'in_georepo'
        )

    @staticmethod
    def model_to_initial(model: ReferenceDataset):
        """Return model data as json."""
        return model_to_dict(model)
