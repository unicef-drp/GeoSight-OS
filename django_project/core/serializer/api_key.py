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
__date__ = '24/10/2023'
__copyright__ = ('Copyright 2023, Unicef')

from rest_framework import serializers

from core.models.api_key import ApiKey


class ApiKeySerializer(serializers.ModelSerializer):
    """Serializer of Api Key."""

    user_id = serializers.SerializerMethodField()
    created = serializers.SerializerMethodField()

    def get_user_id(self, obj: ApiKey):
        """Return user id of api."""
        return obj.token.user.id if obj.token else ''

    def get_created(self, obj: ApiKey):
        """Return created date of api."""
        return obj.token.created

    class Meta:  # noqa: D106
        model = ApiKey
        fields = [
            'user_id',
            'created',
            'platform',
            'owner',
            'contact',
            'is_active'
        ]
