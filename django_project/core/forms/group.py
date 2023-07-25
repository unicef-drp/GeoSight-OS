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
from django.contrib.auth.models import Group
from django.forms.models import model_to_dict

from core.models.group import GeosightGroup


class GroupForm(forms.ModelForm):
    """Group form."""

    class Meta:  # noqa: D106
        model = GeosightGroup
        fields = ('name',)

    @staticmethod
    def model_to_initial(model: GeosightGroup):
        """Return model data as json."""
        initial = model_to_dict(Group.objects.get(id=model.id))
        return initial
