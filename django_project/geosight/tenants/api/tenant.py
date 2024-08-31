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
__date__ = '28/08/2024'
__copyright__ = ('Copyright 2023, Unicef')

from django.http import HttpResponseBadRequest
from rest_framework import status
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import mixins, GenericViewSet

from geosight.data.api.v1.base import BaseApiV1
from geosight.tenants.models.tenant import Tenant
from geosight.tenants.permission import AccessedJustByPublicTenant
from geosight.tenants.serializer import TenantSerializer
from geosight.tenants.utils import create_tenant


class TenantAPI(
    BaseApiV1,
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin,
    GenericViewSet
):
    """Return tenants list."""

    permission_classes = (
        IsAuthenticated, IsAdminUser, AccessedJustByPublicTenant
    )
    model_class = Tenant
    serializer_class = TenantSerializer
    queryset = Tenant.objects.all()

    def create(self, request):
        """Create new tenant."""
        try:
            new_domain = request.data['domain']
            email = request.data['email']
            tenant, domain = create_tenant(
                tenant_schema=new_domain.replace(' ', '_').replace('-', '_'),
                tenant_domain=new_domain, tenant_email=email
            )
            output = self.serializer_class(tenant).data
            headers = self.get_success_headers(output)
            return Response(
                output,
                status=status.HTTP_201_CREATED,
                headers=headers
            )
        except KeyError as e:
            return HttpResponseBadRequest(f'{e} is required')
