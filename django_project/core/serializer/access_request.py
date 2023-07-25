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
__date__ = '25/07/2023'
__copyright__ = ('Copyright 2023, Unicef')

from rest_framework import serializers

from core.models.access_request import UserAccessRequest


class AccessRequestSerializer(serializers.ModelSerializer):
    """Access request serializer."""

    name = serializers.SerializerMethodField()
    submitted_date = serializers.DateTimeField(source='submitted_on')

    def get_name(self, obj: UserAccessRequest):
        """Get name of access."""
        if obj.requester_first_name and obj.requester_last_name:
            return f'{obj.requester_first_name} {obj.requester_last_name}'
        elif obj.requester_first_name:
            return obj.requester_first_name
        return '-'

    class Meta:  # noqa: D106
        model = UserAccessRequest
        fields = [
            'id',
            'name',
            'requester_email',
            'type',
            'status',
            'submitted_date'
        ]


class AccessRequestDetailSerializer(serializers.ModelSerializer):
    """Access request serializer for detail."""

    approval_by = serializers.SerializerMethodField()

    def get_approval_by(self, obj: UserAccessRequest):
        """Get approval by username."""
        if obj.approved_by:
            return obj.approved_by.username
        return None

    class Meta:  # noqa: D106
        model = UserAccessRequest
        fields = [
            'id',
            'type',
            'status',
            'uuid',
            'submitted_on',
            'requester_first_name',
            'requester_last_name',
            'requester_email',
            'description',
            'request_by_id',
            'approved_date',
            'approved_by_id',
            'approver_notes',
            'approval_by'
        ]
