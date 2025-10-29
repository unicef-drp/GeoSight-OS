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
        """
        Get the concept UUID of the entity.

        :param obj: The entity instance.
        :type obj: Entity
        :return: Concept UUID string.
        :rtype: str
        """
        return obj.concept_uuid

    def get_n(self, obj: Entity):
        """
        Get the entity name.

        :param obj: The entity instance.
        :type obj: Entity
        :return: Entity name.
        :rtype: str
        """
        return obj.name

    def get_u(self, obj: Entity):
        """
        Get the entity's unique geometry code (ucode).

        :param obj: The entity instance.
        :type obj: Entity
        :return: Geometry unique code.
        :rtype: str
        """
        return obj.geom_id

    def get_pu(self, obj: Entity):
        """
        Get the list of parent unique codes (ucodes).

        :param obj: The entity instance.
        :type obj: Entity
        :return: Ordered list of parent ucodes.
        :rtype: list[str]
        """
        parents = obj.parents
        parents.reverse()
        return list(parents)

    def get_pc(self, obj: Entity):
        """
        Get the list of parent concept UUIDs.

        If not cached, fetch from the database and cache them.

        :param obj: The entity instance.
        :type obj: Entity
        :return: Ordered list of parent concept UUIDs.
        :rtype: list[str]
        """
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
        """
        Get the geometry code for the entity.

        :param obj: The entity instance.
        :type obj: Entity
        :return: The geometry unique identifier.
        :rtype: str
        """
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
        """
        Get metadata for the specified administrative level of the entity.

        :param obj: The entity instance.
        :type obj: Entity
        :param admin_level: The administrative level index.
        :type admin_level: int
        :return:
            A dictionary with level information, or ``None`` if unavailable.
        :rtype: dict or None
        """
        return None

    def get_parents(self, obj: Entity):
        """
        Get the list of parent entities with metadata.

        :param obj: The entity instance.
        :type obj: Entity
        :return: A list of dictionaries containing parent details.
        :rtype: list[dict]
        """
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
        """
        Get the unique geometry code (ucode) for the entity.

        :param obj: The entity instance.
        :type obj: Entity
        :return: Geometry unique code.
        :rtype: str
        """
        return obj.geom_id

    def get_level_name(self, obj: Entity):
        """
        Get the human-readable administrative level name.

        :param obj: The entity instance.
        :type obj: Entity
        :return: Level name or ``'-'`` if unavailable.
        :rtype: str
        """
        level = self.entity_level(obj, obj.admin_level)
        return level['name'] if level else '-'

    def get_centroid(self, obj: Entity):
        """
        Get the centroid of the entity's geometry in WKT format.

        :param obj: The entity instance.
        :type obj: Entity
        :return: Centroid as WKT string, or ``None`` if no geometry.
        :rtype: str or None
        """
        if obj.geometry:
            return obj.geometry.centroid.wkt
        return None

    def get_bbox(self, obj: Entity):
        """
        Get the bounding box (extent) of the entity geometry.

        :param obj: The entity instance.
        :type obj: Entity
        :return: Geometry extent tuple (minx, miny, maxx, maxy), or ``None``.
        :rtype: tuple or None
        """
        if obj.geometry:
            return obj.geometry.extent
        return None

    def get_ext_codes(self, obj: Entity):
        """
        Get external codes for the entity.

        :param obj: The entity instance.
        :type obj: Entity
        :return: Dictionary of external codes.
        :rtype: dict
        """
        return {
            "default": obj.geom_id
        }

    class Meta:  # noqa: D106
        model = Entity
        fields = (
            'id', 'name', 'ucode', 'concept_uuid', 'admin_level', 'parents',
            'level_name', 'bbox', 'centroid', 'ext_codes'
        )


class ApiEntityGeoSerializer(ApiEntitySerializer, GeoFeatureModelSerializer):
    """Return Entity with geometry."""

    class Meta(ApiEntitySerializer.Meta):  # noqa: D106
        geo_field = "geometry"
        fields = ApiEntitySerializer.Meta.fields
