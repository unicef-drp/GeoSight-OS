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

from rest_framework import serializers
from rest_framework_gis.serializers import GeoFeatureModelSerializer

from geosight.georepo.models.entity import Entity


class EntityCentroidSerializer(GeoFeatureModelSerializer):
    """Centroid serializer for entity."""

    c = serializers.SerializerMethodField()
    n = serializers.SerializerMethodField()
    u = serializers.SerializerMethodField()

    def get_c(self, obj: Entity):
        """Return concept uuid."""
        return obj.concept_uuid

    def get_n(self, obj: Entity):
        """Return name."""
        return obj.name

    def get_u(self, obj: Entity):
        """Return ucode."""
        return obj.geom_id

    class Meta:  # noqa: D106
        model = Entity
        geo_field = 'centroid'
        fields = ('c', 'n', 'u')


class EntitySerializer(serializers.ModelSerializer):
    """Serializer for Entity."""

    geom_code = serializers.SerializerMethodField()

    def get_geom_code(self, obj: Entity):
        """Return value."""
        return obj.geom_id

    class Meta:  # noqa: D106
        model = Entity
        fields = ('name', 'geom_code', 'concept_uuid', 'admin_level')


class ApiEntitySerializer(serializers.ModelSerializer):
    """Serializer for Entity."""

    levels = {}
    parents = serializers.SerializerMethodField()
    ucode = serializers.SerializerMethodField()
    level_name = serializers.SerializerMethodField()
    centroid = serializers.SerializerMethodField()
    bbox = serializers.SerializerMethodField()

    def entity_level(self, obj: Entity, admin_level: int):
        """Return levels of entity."""
        try:
            levels = self.levels[obj.reference_layer.id]
        except KeyError:
            levels = []
            for level in obj.reference_layer.levels:
                levels.append({
                    'level': level.level,
                    'name': level.name
                })
        try:
            return levels[admin_level]
        except IndexError:
            return None

    def get_parents(self, obj: Entity):
        """Return ucode."""
        output = []
        for idx, parent in enumerate(obj.parents):
            level = self.entity_level(obj, idx)
            output.append(
                {
                    "default": parent,
                    "ucode": parent,
                    "admin_level": idx,
                    "type": level['name'] if level else '-'
                }
            )
        return output

    def get_ucode(self, obj: Entity):
        """Return ucode."""
        return obj.geom_id

    def get_level_name(self, obj: Entity):
        """Return level name."""
        level = self.entity_level(obj, obj.admin_level)
        return level['name'] if level else '-'

    def get_centroid(self, obj: Entity):
        """Return bbox."""
        return obj.geometry.centroid.wkt

    def get_bbox(self, obj: Entity):
        """Return bbox."""
        return obj.geometry.extent

    class Meta:  # noqa: D106
        model = Entity
        fields = (
            'id', 'name', 'ucode', 'concept_uuid', 'admin_level', 'parents',
            'level_name', 'bbox', 'centroid'
        )
