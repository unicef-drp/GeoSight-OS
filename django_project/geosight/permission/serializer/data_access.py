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

from geosight.permission.models import (
    ReferenceLayerIndicatorPermission as Permission,
    ReferenceLayerIndicatorUserPermission as UserPermission,
    ReferenceLayerIndicatorGroupPermission as GroupPermission
)


class GeneralPermissionsSerializer(serializers.ModelSerializer):
    """Serializer for Permission."""

    dataset_id = serializers.SerializerMethodField()
    dataset_name = serializers.SerializerMethodField()
    indicator_id = serializers.SerializerMethodField()
    indicator_name = serializers.SerializerMethodField()
    permission = serializers.SerializerMethodField()

    def get_dataset_id(self, obj: Permission):
        """Return Dataset id."""
        return obj.obj.reference_layer.id

    def get_dataset_name(self, obj: Permission):
        """Return Dataset name."""
        return obj.obj.reference_layer.name

    def get_indicator_id(self, obj: Permission):
        """Return indicator id."""
        return obj.obj.indicator.id

    def get_indicator_name(self, obj: Permission):
        """Return indicator name."""
        return obj.obj.indicator.name

    def get_permission(self, obj: Permission):
        """Return permission."""
        return obj.public_permission

    class Meta:  # noqa: D106
        model = Permission
        fields = [
            'id',
            'dataset_id', 'dataset_name',
            'indicator_id', 'indicator_name', 'permission'
        ]


class UsersPermissionsSerializer(serializers.ModelSerializer):
    """Serializer for Permission."""

    dataset_id = serializers.SerializerMethodField()
    dataset_name = serializers.SerializerMethodField()
    indicator_id = serializers.SerializerMethodField()
    indicator_name = serializers.SerializerMethodField()
    user_id = serializers.SerializerMethodField()
    user_username = serializers.SerializerMethodField()
    permission = serializers.SerializerMethodField()

    def get_dataset_id(self, obj: UserPermission):
        """Return Dataset id."""
        return obj.obj.obj.reference_layer.id

    def get_dataset_name(self, obj: UserPermission):
        """Return Dataset name."""
        return obj.obj.obj.reference_layer.name

    def get_indicator_id(self, obj: UserPermission):
        """Return indicator id."""
        return obj.obj.obj.indicator.id

    def get_indicator_name(self, obj: UserPermission):
        """Return indicator name."""
        return obj.obj.obj.indicator.name

    def get_user_id(self, obj: UserPermission):
        """Return user id."""
        return obj.user.id

    def get_user_username(self, obj: UserPermission):
        """Return username."""
        return obj.user.username

    def get_permission(self, obj: UserPermission):
        """Return permission."""
        return obj.permission

    class Meta:  # noqa: D106
        model = UserPermission
        fields = [
            'id',
            'dataset_id', 'dataset_name',
            'indicator_id', 'indicator_name',
            'user_id', 'user_username',
            'permission'
        ]


class GroupsPermissionsSerializer(serializers.ModelSerializer):
    """Serializer for Permission."""

    dataset_id = serializers.SerializerMethodField()
    dataset_name = serializers.SerializerMethodField()
    indicator_id = serializers.SerializerMethodField()
    indicator_name = serializers.SerializerMethodField()
    group_id = serializers.SerializerMethodField()
    group_name = serializers.SerializerMethodField()
    permission = serializers.SerializerMethodField()

    def get_dataset_id(self, obj: UserPermission):
        """Return Dataset id."""
        return obj.obj.obj.reference_layer.id

    def get_dataset_name(self, obj: UserPermission):
        """Return Dataset name."""
        return obj.obj.obj.reference_layer.name

    def get_indicator_id(self, obj: UserPermission):
        """Return indicator id."""
        return obj.obj.obj.indicator.id

    def get_indicator_name(self, obj: UserPermission):
        """Return indicator name."""
        return obj.obj.obj.indicator.name

    def get_group_id(self, obj: UserPermission):
        """Return group id."""
        return obj.group.id

    def get_group_name(self, obj: UserPermission):
        """Return group name."""
        return obj.group.name

    def get_permission(self, obj: UserPermission):
        """Return permission."""
        return obj.permission

    class Meta:  # noqa: D106
        model = GroupPermission
        fields = [
            'id',
            'dataset_id', 'dataset_name',
            'indicator_id', 'indicator_name',
            'group_id', 'group_name',
            'permission'
        ]
