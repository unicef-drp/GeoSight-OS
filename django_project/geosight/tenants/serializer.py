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
from geosight.tenants.models import Tenant, ContentLimitation, Domain


class TenantSerializer(DynamicModelSerializer):
    """Serializer for Tenant."""

    created_at = serializers.DateTimeField()

    class Meta:  # noqa: D106
        model = Tenant
        exclude = ('timezone',)


class ContentLimitationSerializer(DynamicModelSerializer):
    """Serializer for ContentLimitation."""

    tenant_name = serializers.SerializerMethodField()
    tenant_domain = serializers.SerializerMethodField()

    def get_tenant_name(self, obj: ContentLimitation):
        """Get tenant name."""
        return obj.tenant.name

    def get_tenant_domain(self, obj: ContentLimitation):
        """Get tenant domain url."""
        domain = Domain.objects.filter(
            tenant=obj.tenant, is_primary=True
        ).first()
        if domain:
            return domain.domain
        return domain

    class Meta:  # noqa: D106
        model = ContentLimitation
        exclude = (
            'id', 'model_field_group', 'content_type'
        )
        extra_kwargs = {
            'id': {'read_only': True},
            'tenant': {'read_only': True},
            'content_type': {'read_only': True},
            'model_field_group': {'read_only': True},
            'description': {'read_only': True},
            'tenant_name': {'read_only': True},
            'tenant_domain': {'read_only': True},
        }
