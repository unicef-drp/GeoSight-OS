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

from django.contrib.auth import get_user_model
from rest_framework import serializers

from core.serializer.dynamic_serializer import DynamicModelSerializer

User = get_user_model()


class UserSerializer(DynamicModelSerializer):
    """User serializer."""

    is_staff = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()
    is_contributor = serializers.SerializerMethodField()
    is_creator = serializers.SerializerMethodField()
    is_admin = serializers.SerializerMethodField()
    receive_notification = serializers.SerializerMethodField()

    def get_is_staff(self, obj: User):
        """Return is staff."""
        return obj.is_staff

    def get_name(self, obj: User):
        """Return is staff."""
        return obj.get_full_name() if obj.get_full_name() else obj.username

    def get_full_name(self, obj: User):
        """Return full name."""
        return obj.get_full_name()

    def get_role(self, obj: User):
        """Return role."""
        return obj.profile.role

    def get_is_contributor(self, obj: User):
        """Return is contributor."""
        return obj.profile.is_contributor

    def get_is_creator(self, obj: User):
        """Return is creator."""
        return obj.profile.is_creator

    def get_is_admin(self, obj: User):
        """Return is admin."""
        return obj.profile.is_admin

    def get_receive_notification(self, obj: User):
        """Return is admin."""
        return obj.profile.receive_notification

    class Meta:  # noqa: D106
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name',
            'is_staff', 'name', 'email', 'role',
            'is_contributor', 'is_creator', 'is_admin', 'full_name',
            'receive_notification'
        )
