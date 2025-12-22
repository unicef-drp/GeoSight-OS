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
from django.conf import settings
from django.forms.models import model_to_dict
from rest_framework.exceptions import ValidationError

from geosight.data.models.context_layer import (
    ContextLayer, ContextLayerGroup, LayerType
)
from geosight.data.models.related_table import RelatedTable


class ContextLayerBatchForm(forms.ModelForm):
    """ContextLayer form."""

    group = forms.ChoiceField(
        label='Category',
        widget=forms.Select(
            attrs={'data-autocreated': 'True'}
        )
    )

    class Meta:  # noqa: D106
        model = ContextLayer
        exclude = [
            'created_at', 'creator', 'modified_at', 'modified_by',
            'layer_type', 'arcgis_config', 'related_table', 'url_legend',
            'token', 'username', 'password', 'styles', 'label_styles',
            'configuration', 'cloud_native_gis_layer_id'
        ]

    def __init__(self, *args, **kwargs):  # noqa
        """Initialize the form."""
        super().__init__(*args, **kwargs)
        self.fields['group'].choices = [
            (group.name, group.name)
            for group in ContextLayerGroup.objects.all().order_by('name')
        ]

        try:
            if self.data['group']:
                self.fields['group'].choices += [
                    (self.data['group'], self.data['group'])
                ]
        except KeyError:
            pass

    def clean_group(self):
        """Validate and return a :class:`ContextLayerGroup` instance.

        :return: The existing or newly created :class:`ContextLayerGroup`.
        :rtype: ContextLayerGroup
        """
        group, created = ContextLayerGroup.objects.get_or_create(
            name=self.cleaned_data['group']
        )
        return group


class ContextLayerForm(forms.ModelForm):
    """ContextLayer form."""

    group = forms.ChoiceField(
        label='Category',
        widget=forms.Select(
            attrs={'data-autocreated': 'True'}
        )
    )

    data_fields = forms.CharField(
        required=False,
        widget=forms.HiddenInput()
    )

    styles = forms.CharField(
        required=False,
        widget=forms.HiddenInput()
    )

    label_styles = forms.CharField(
        required=False,
        widget=forms.HiddenInput()
    )

    related_table = forms.CharField(
        label='Related Table',
        required=False,
        widget=forms.HiddenInput()
    )

    configuration = forms.CharField(
        required=False,
        widget=forms.HiddenInput()
    )

    cloud_native_gis_layer_id = forms.CharField(
        label='Cloud Native GIS Layer',
        required=False,
        widget=forms.HiddenInput()
    )

    def __init__(self, *args, **kwargs):  # noqa
        """Initialize the form."""
        try:
            args[0]['group'] = args[0]['category']
        except Exception:
            pass
        # If styles is object, convert to string
        try:
            if not isinstance(args[0]['styles'], str):
                args[0]['styles'] = json.dumps(args[0]['styles'])
        except Exception:
            pass
        # If it does not have override_style and has styles
        try:
            args[0]['override_style']
        except Exception:
            try:
                if args[0]['styles']:
                    args[0]['override_style'] = True
            except Exception:
                pass

        super().__init__(*args, **kwargs)
        self.fields['group'].choices = [
            (group.name, group.name)
            for group in ContextLayerGroup.objects.all().order_by('name')
        ]

        try:
            if self.data['group']:
                self.fields['group'].choices += [
                    (self.data['group'], self.data['group'])
                ]
        except KeyError:
            pass

        if not settings.CLOUD_NATIVE_GIS_ENABLED:
            self.fields['layer_type'].choices = [
                choice for choice in self.fields['layer_type'].choices if
                choice[0] != LayerType.CLOUD_NATIVE_GIS_LAYER
            ]

    def clean_group(self):
        """Validate and return a :class:`ContextLayerGroup` instance.

        :return: The existing or newly created :class:`ContextLayerGroup`.
        :rtype: ContextLayerGroup
        """
        group, created = ContextLayerGroup.objects.get_or_create(
            name=self.cleaned_data['group']
        )
        return group

    def clean_related_table(self):
        """Validate and return a :class:`RelatedTable` instance if applicable.

        :return: A related table instance or ``None``.
        :rtype: RelatedTable or None
        """
        if self.instance and self.cleaned_data['related_table']:
            return RelatedTable.objects.get(
                pk=self.cleaned_data['related_table']
            )
        return None

    def clean_cloud_native_gis_layer_id(self):
        """Validate and return the cloud-native GIS layer ID.

        Only applicable if ``CLOUD_NATIVE_GIS_ENABLED`` is True.

        :return: The layer primary key or ``None``.
        :rtype: int or None
        """
        if settings.CLOUD_NATIVE_GIS_ENABLED:
            from cloud_native_gis.models import Layer
            if self.instance and self.cleaned_data[
                'cloud_native_gis_layer_id'
            ]:
                return Layer.objects.get(
                    pk=self.cleaned_data['cloud_native_gis_layer_id']
                ).pk
            return None
        return None

    def clean_styles(self):
        """Validate and return the serialized styles.

        If ``override_style`` is True or layer type is raster,
        the provided style is used. Otherwise, retains existing styles.

        :raises ValidationError: If ``layer_type`` is missing.
        :return: Serialized style string or ``None``.
        :rtype: str or None
        """
        try:
            if self.data['layer_type'] != LayerType.CLOUD_NATIVE_GIS_LAYER:
                if self.instance and not self.cleaned_data['styles']:
                    return self.instance.styles
        except KeyError:
            raise ValidationError("layer_type is required.")
        try:
            override_style = self.data['override_style']
        except KeyError:
            override_style = False

        # Raster cog always override style
        if self.data['layer_type'] == LayerType.RASTER_COG:
            override_style = True

        if override_style:
            return self.cleaned_data['styles']

    def clean_label_styles(self):
        """Validate and return label styles.

        :return: Label style JSON string.
        :rtype: str
        """
        if self.instance and not self.cleaned_data['label_styles']:
            return self.instance.label_styles
        return self.cleaned_data['label_styles']

    class Meta:  # noqa: D106
        model = ContextLayer
        exclude = (
            'created_at', 'creator', 'modified_at', 'modified_by'
        )

    @staticmethod
    def model_to_initial(model: ContextLayer):
        """Convert `ContextLayer` instance into an initial form dictionary.

        :param model: The :class:`ContextLayer` instance to convert.
        :type model: ContextLayer
        :return: A dictionary suitable for populating form initial data.
        :rtype: dict
        """
        from geosight.data.serializer.context_layer import (
            ContextLayerFieldSerializer
        )
        initial = model_to_dict(model)
        try:
            initial['group'] = ContextLayerGroup.objects.get(
                id=initial['group']
            ).name
        except ContextLayerGroup.DoesNotExist:
            initial['group'] = None
        try:
            initial['data_fields'] = json.dumps(
                ContextLayerFieldSerializer(
                    model.contextlayerfield_set.all(), many=True
                ).data
            )
        except ContextLayerGroup.DoesNotExist:
            initial['data_fields'] = ''
        return initial
