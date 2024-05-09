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
__date__ = '08/06/2024'
__copyright__ = ('Copyright 2023, Unicef')

from django.core.exceptions import DisallowedHost
from django.db import connection
from django_tenants.middleware.main import (
    TenantMainMiddleware as TenantMainMiddlewareDefault
)
from django_tenants.utils import (
    get_tenant_domain_model
)


class TenantMainMiddleware(TenantMainMiddlewareDefault):
    """Return schema name by domain."""

    def process_request(self, request):
        """Connection needs first to be at the public schema.
        as this is where the tenant metadata is stored.
        """

        # Skip using tenant if schema-name-by-domain
        url = request.build_absolute_uri()
        if 'schema-name-by-domain' in url:
            self.setup_url_routing(request)
            return

        connection.set_schema_to_public()
        try:
            hostname = self.hostname_from_request(request)
        except DisallowedHost:
            from django.http import HttpResponseNotFound
            return HttpResponseNotFound()

        domain_model = get_tenant_domain_model()
        try:
            tenant = self.get_tenant(domain_model, hostname)
        except domain_model.DoesNotExist:
            self.no_tenant_found(request, hostname)
            return

        tenant.domain_url = hostname
        request.tenant = tenant
        connection.set_tenant(request.tenant)
        self.setup_url_routing(request)
