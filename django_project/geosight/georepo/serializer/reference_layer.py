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
__date__ = '12/02/2024'
__copyright__ = ('Copyright 2023, Unicef')

from django.contrib.gis.db.models import Extent
from django.urls import reverse
from rest_framework import serializers

from geosight.georepo.models.reference_layer import (
    ReferenceLayerView, ReferenceLayerViewLevel
)


class ReferenceLayerViewLevelSerializer(serializers.ModelSerializer):
    """Serializer for ReferenceLayerViewLevel."""

    level_name = serializers.SerializerMethodField()
    url = serializers.SerializerMethodField()

    def get_level_name(self, obj: ReferenceLayerViewLevel):
        """Return value."""
        return obj.name

    def get_url(self, obj: ReferenceLayerViewLevel):
        """Return value."""
        return reverse(
            'boundary-entity-api-list',
            kwargs={'identifier': obj.reference_layer.identifier}
        ) + f'?admin_level={obj.level}'

    class Meta:  # noqa: D106
        model = ReferenceLayerViewLevel
        fields = ('level', 'level_name', 'url')


class ReferenceLayerViewSerializer(serializers.ModelSerializer):
    """Serializer for ReferenceLayerView."""

    bbox = serializers.SerializerMethodField()
    vector_tiles = serializers.SerializerMethodField()
    possible_id_types = serializers.SerializerMethodField()
    dataset_levels = serializers.SerializerMethodField()

    def get_bbox(self, obj: ReferenceLayerView):
        """Return value."""
        return obj.entity_set.aggregate(
            Extent('geometry')
        )['geometry__extent']

    def get_vector_tiles(self, obj: ReferenceLayerView):
        """Return value."""
        url = reverse(
            'boundary-vector-tile-api',
            kwargs={
                'identifier': obj.identifier,
                'z': '0',
                'x': '1',
                'y': '2',
            }
        )
        request = self.context.get('request', None)
        if request:
            url = request.build_absolute_uri(url)
        url = url.replace(
            '/0/', '/{z}/'
        ).replace(
            '/1/', '/{x}/'
        ).replace(
            '/2/', '/{y}/'
        )
        return url

    def get_possible_id_types(self, obj: ReferenceLayerView):
        """Return value."""
        return [
            "ucode",
            "concept_uuid"
        ]

    def get_dataset_levels(self, obj: ReferenceLayerView):
        """Return value."""
        return ReferenceLayerViewLevelSerializer(
            obj.referencelayerviewlevel_set.order_by('level'), many=True
        ).data

    class Meta:  # noqa: D106
        model = ReferenceLayerView
        fields = (
            'id', 'name', 'identifier', 'vector_tiles',
            'description', 'possible_id_types', 'dataset_levels',
            'bbox', 'is_local'
        )
        lookup_field = "identifier"


class ReferenceLayerCentroidUrlSerializer(serializers.ModelSerializer):
    """Serializer for ReferenceLayerView."""

    level_name = serializers.SerializerMethodField()
    url = serializers.SerializerMethodField()

    def get_level_name(self, obj: ReferenceLayerViewLevel):
        """Return value."""
        return obj.name

    def get_url(self, obj: ReferenceLayerViewLevel):
        """Return value."""
        return reverse(
            'boundary-centroid-api',
            kwargs={
                'identifier': obj.reference_layer.identifier,
                'level': obj.level
            }
        )

    class Meta:  # noqa: D106
        model = ReferenceLayerViewLevel
        fields = ('level', 'level_name', 'url')
