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

from core.serializer.dynamic_serializer import DynamicModelSerializer
from geosight.georepo.models.entity import Entity


class EntityCentroidSerializer(GeoFeatureModelSerializer):
    """Centroid serializer for entity."""

    entities_by_ucode = {}

    c = serializers.SerializerMethodField()
    n = serializers.SerializerMethodField()
    u = serializers.SerializerMethodField()
    pu = serializers.SerializerMethodField()
    pc = serializers.SerializerMethodField()

    def get_c(self, obj: Entity):
        """Return concept uuid."""
        return obj.concept_uuid

    def get_n(self, obj: Entity):
        """Return name."""
        return obj.name

    def get_u(self, obj: Entity):
        """Return ucode."""
        return obj.geom_id

    def get_pu(self, obj: Entity):
        """Return ucode."""
        parents = obj.parents
        parents.reverse()
        return list(parents)

    def get_pc(self, obj: Entity):
        """Return ucode."""
        pcs = []
        parents = obj.parents
        parents.reverse()
        for parent in parents:
            try:
                pcs.append(self.entities_by_ucode[parent])
            except KeyError:
                try:
                    entity = Entity.objects.get(
                        geom_id=parent
                    ).concept_uuid
                    self.entities_by_ucode[parent] = entity
                    pcs.append(entity)
                except Entity.DoesNotExist:
                    pass
        return pcs

    class Meta:  # noqa: D106
        model = Entity
        geo_field = 'centroid'
        fields = ('c', 'n', 'u', 'pu', 'pc')


class EntitySerializer(DynamicModelSerializer):
    """Serializer for Entity."""

    geom_code = serializers.SerializerMethodField()

    def get_geom_code(self, obj: Entity):
        """Return value."""
        return obj.geom_id

    class Meta:  # noqa: D106
        model = Entity
        fields = ('name', 'geom_code', 'concept_uuid', 'admin_level')


class ApiEntitySerializer(DynamicModelSerializer):
    """Serializer for Entity."""

    levels = {}
    parents = serializers.SerializerMethodField()
    ucode = serializers.SerializerMethodField()
    level_name = serializers.SerializerMethodField()
    centroid = serializers.SerializerMethodField()
    bbox = serializers.SerializerMethodField()
    ext_codes = serializers.SerializerMethodField()

    def entity_level(self, obj: Entity, admin_level: int):
        """Return levels of entity."""
        return None

    def get_parents(self, obj: Entity):
        """Return ucode."""
        output = []
        if not obj.parents:
            return output
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
        if obj.geometry:
            return obj.geometry.centroid.wkt
        return None

    def get_bbox(self, obj: Entity):
        """Return bbox."""
        if obj.geometry:
            return obj.geometry.extent
        return None

    def get_ext_codes(self, obj: Entity):
        """Return ext_codes."""
        return {
            "default": obj.geom_id
        }

    class Meta:  # noqa: D106
        model = Entity
        fields = (
            'id', 'name', 'ucode', 'concept_uuid', 'admin_level', 'parents',
            'level_name', 'bbox', 'centroid', 'ext_codes'
        )
