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

from django.contrib.auth.models import Group
from rest_framework import serializers

from core.serializer.dynamic_serializer import DynamicModelSerializer
from core.serializer.user import UserSerializer


class GroupSerializer(DynamicModelSerializer):
    """Group serializer."""
    users = serializers.SerializerMethodField()

    def get_users(self, obj: Group):
        """Return users."""
        return UserSerializer(obj.user_set.all(), many=True).data

    class Meta:  # noqa: D106
        model = Group
        fields = ('id', 'name', 'users')
