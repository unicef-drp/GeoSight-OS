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
__date__ = '09/01/2025'
__copyright__ = ('Copyright 2025, Unicef')

from rest_framework import serializers

from core.serializer.dynamic_serializer import DynamicModelSerializer


class ResourceSerializer(DynamicModelSerializer):
    """Serializer for resource objects exposing audit fields.

    Provides formatted ``created_at``, ``created_by``, ``modified_at``,
    and ``modified_by`` fields derived from the model's audit attributes.
    """

    modified_at = serializers.SerializerMethodField()
    modified_by = serializers.SerializerMethodField()
    created_at = serializers.SerializerMethodField()
    created_by = serializers.SerializerMethodField()

    def get_modified_at(self, obj):
        """Return the last modified timestamp formatted as a string.

        :param obj: The resource instance being serialized.
        :type obj: django.db.models.Model
        :return: Formatted datetime string (``YYYY-MM-DD HH:MM:SS``).
        :rtype: str
        """
        if not obj.modified_at:
            return None
        return obj.modified_at.strftime('%Y-%m-%d %H:%M:%S')

    def get_modified_by(self, obj):
        """Return the username of the user who last modified the object.

        :param obj: The resource instance being serialized.
        :type obj: django.db.models.Model
        :return: Username of the last modifier, or ``None``.
        :rtype: str or None
        """
        return obj.modified_by_username

    def get_created_at(self, obj):
        """Return the creation timestamp formatted as a string.

        :param obj: The resource instance being serialized.
        :type obj: django.db.models.Model
        :return: Formatted datetime string (``YYYY-MM-DD HH:MM:SS``).
        :rtype: str
        """
        return obj.created_at.strftime('%Y-%m-%d %H:%M:%S')

    def get_created_by(self, obj):
        """Return the username of the user who created the object.

        :param obj: The resource instance being serialized.
        :type obj: django.db.models.Model
        :return: Username of the creator, or ``None``.
        :rtype: str or None
        """
        return obj.creator_username

    class Meta:  # noqa: D106
        fields = (
            'created_at', 'created_by', 'modified_at', 'modified_by',
        )
