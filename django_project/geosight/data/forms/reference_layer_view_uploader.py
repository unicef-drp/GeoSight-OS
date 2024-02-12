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

from geosight.georepo.models.reference_layer import ReferenceLayerView
from geosight.georepo.models.reference_layer_uploader import (
    ReferenceLayerViewUploader, ReferenceLayerViewUploaderLevel
)


class ReferenceLayerViewCreateForm(forms.ModelForm):
    """ReferenceLayerViewUploader form."""

    def clean_name(self):
        """Return name."""
        name = self.cleaned_data['name']
        views = ReferenceLayerView.objects.exclude(
            id=self.instance.id
        ).filter(name=name)
        if views.count():
            raise ValidationError(
                f"The View with name `{name}` is already exist."
            )
        return name

    class Meta:  # noqa: D106
        model = ReferenceLayerViewUploader
        exclude = ('created_at', 'creator', 'modified_at')

    @staticmethod
    def model_to_initial(model: ReferenceLayerViewUploader):
        """Return model data as json."""
        return model_to_dict(model)


class ReferenceLayerViewUploaderLevelForm(forms.ModelForm):
    """ReferenceLayerViewUploader form."""

    class Meta:  # noqa: D106
        model = ReferenceLayerViewUploaderLevel
        exclude = ('created_at', 'creator', 'modified_at')

    @staticmethod
    def model_to_initial(model: ReferenceLayerViewUploaderLevel):
        """Return model data as json."""
        return model_to_dict(model)
