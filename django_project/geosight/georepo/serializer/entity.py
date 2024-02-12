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

from geosight.georepo.models.entity import Entity


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

    ucode = serializers.SerializerMethodField()
    level_name = serializers.SerializerMethodField()

    def get_ucode(self, obj: Entity):
        """Return ucode."""
        return obj.geom_id

    def get_level_name(self, obj: Entity):
        """Return level name."""
        return 'Level name'

    class Meta:  # noqa: D106
        model = Entity
        fields = (
            'id', 'name', 'ucode', 'concept_uuid', 'admin_level', 'level_name'
        )
