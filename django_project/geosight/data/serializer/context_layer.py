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
import urllib.parse

from rest_framework import serializers

from geosight.data.models.context_layer import (
    ContextLayer, ContextLayerField
)
from geosight.data.serializer.resource import ResourceSerializer


class ContextLayerSerializer(ResourceSerializer):
    """Serializer for ContextLayer."""

    url = serializers.SerializerMethodField()
    parameters = serializers.SerializerMethodField()
    styles = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()
    data_fields = serializers.SerializerMethodField()
    label_styles = serializers.SerializerMethodField()
    permission = serializers.SerializerMethodField()
    original_styles = serializers.SerializerMethodField()
    original_configuration = serializers.SerializerMethodField()
    configuration = serializers.SerializerMethodField()

    def get_url(self, obj: ContextLayer):
        """Url."""
        return urllib.parse.unquote(obj.url.split('?')[0]) if obj.url else None

    def get_parameters(self, obj: ContextLayer):
        """Return parameters."""
        parameters = {}
        if obj.url:
            urls = obj.url.split('?')
            if len(urls) > 1:
                for param in urls[1].split('&'):
                    params = param.split('=')
                    if params[0].lower() != 'bbox':
                        parameters[params[0]] = '='.join(params[1:])
        return parameters

    def get_category(self, obj: ContextLayer):
        """Return category name."""
        return obj.group.name if obj.group else ''

    def get_data_fields(self, obj: ContextLayer):
        """Return category name."""
        return ContextLayerFieldSerializer(
            obj.contextlayerfield_set.all(), many=True
        ).data

    def get_styles(self, obj: ContextLayer):
        """Return category name."""
        return json.loads(obj.styles) if obj.styles else None

    def get_original_styles(self, obj: ContextLayer):
        """Return original_styles."""
        return json.loads(obj.styles) if obj.styles else None

    def get_label_styles(self, obj: ContextLayer):
        """Return category name."""
        return json.loads(obj.label_styles) if obj.label_styles else {}

    def get_permission(self, obj: ContextLayer):
        """Return permission."""
        return obj.permission.all_permission(
            self.context.get('user', None)
        )

    def get_configuration(self, obj: ContextLayer):
        """Return original_configuration."""
        if not obj.configuration:
            return None
        if isinstance(obj.configuration, str):
            return json.loads(obj.configuration)
        return obj.configuration

    def get_original_configuration(self, obj: ContextLayer):
        """Return original_configuration."""
        if not obj.configuration:
            return None
        if isinstance(obj.configuration, str):
            return json.loads(obj.configuration)
        return obj.configuration

    class Meta:  # noqa: D106
        model = ContextLayer
        exclude = (
            'password', 'username',
            'cloud_native_gis_layer_id', 'arcgis_config',
            'related_table', 'token', 'url_legend', 'group'
        )


class ContextLayerFieldSerializer(serializers.ModelSerializer):
    """Serializer for ContextLayerField."""

    class Meta:  # noqa: D106
        model = ContextLayerField
        fields = '__all__'
