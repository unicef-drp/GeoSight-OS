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
__date__ = '28/08/2023'
__copyright__ = ('Copyright 2023, Unicef')

from rest_framework import serializers

from core.serializer.dynamic_serializer import DynamicModelSerializer
from geosight.tenants.models import Tenant


class TenantSerializer(DynamicModelSerializer):
    """Serializer for Tenant."""

    created_at = serializers.DateTimeField()

    class Meta:  # noqa: D106
        model = Tenant
        exclude = ('timezone',)
