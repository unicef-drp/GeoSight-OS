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

import json

from django import forms
from django.contrib.gis.geos import Polygon
from django.template.defaultfilters import slugify

from geosight.data.models.dashboard import Dashboard, DashboardGroup
from geosight.georepo.models import ReferenceLayerView


class DashboardForm(forms.ModelForm):
    """Dashboard form."""

    slug = forms.SlugField()
    group = forms.ChoiceField(
        label='Category',
        required=False,
        widget=forms.Select(
            attrs={'data-autocreated': 'True'}
        )
    )
    reference_layer = forms.CharField(
        label='Reference Layer',
        required=False
    )

    class Meta:  # noqa: D106
        model = Dashboard
        exclude = (
            'basemap_layers', 'default_basemap_layer', 'indicators',
            'context_layers', 'created_at', 'version_data'
        )

    def __init__(self, *args, **kwargs):
        """Init."""
        super().__init__(*args, **kwargs)
        self.fields['group'].choices = [
            (group.name, group.name)
            for group in DashboardGroup.objects.all().order_by('name')
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
        group, created = DashboardGroup.objects.get_or_create(
            name=self.cleaned_data['group']
        )
        return group

    def clean_reference_layer(self):
        """Return group."""
        reference_layer, created = ReferenceLayerView.objects.get_or_create(
            identifier=self.cleaned_data['reference_layer']
        )
        return reference_layer

    @staticmethod
    def update_data(data):
        """Update data from POST data."""
        if 'slug' not in data:
            data['slug'] = slugify(data['name'])
        else:
            data['slug'] = slugify(data['slug'])

        try:
            other_data = json.loads(data['data'])
        except TypeError:
            other_data = data['data']

        # save polygon
        try:
            poly = Polygon.from_bbox(other_data['extent'])
        except ValueError:
            raise ValueError(
                'Invalid extent, '
                'it seems the extent from GeoRepo is empty or not correct.'
            )
        poly.srid = 4326
        data['extent'] = poly

        # save others data
        data['reference_layer'] = other_data['reference_layer']
        data['level_config'] = other_data.get('level_config', {})

        data['geo_field'] = data.get('geoField', 'geometry_code')

        data['indicators'] = other_data['indicators']
        data['indicator_layers'] = other_data['indicator_layers']
        data['indicator_layers_structure'] = \
            other_data['indicator_layers_structure']

        data['context_layers'] = other_data['context_layers']
        data['context_layers_structure'] = \
            other_data['context_layers_structure']

        data['basemaps_layers'] = other_data['basemaps_layers']
        data['basemaps_layers_structure'] = other_data[
            'basemaps_layers_structure']
        data['widgets'] = other_data['widgets']
        data['widgets_structure'] = other_data['widgets_structure']

        data['related_tables'] = other_data.get('related_tables', [])

        data['filters'] = json.dumps(other_data['filters'])
        data['filters_allow_modify'] = other_data.get(
            'filters_allow_modify', False)
        try:
            data['permission'] = other_data['permission']
        except KeyError:
            data['permission'] = None
        return data
