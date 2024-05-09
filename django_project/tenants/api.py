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

from django.http import HttpResponseForbidden
from django_tenants.utils import (
    remove_www, get_tenant_domain_model
)
from rest_framework.response import Response
from rest_framework.views import APIView


class SchemaNameByDomain(APIView):
    """Return schema name by domain."""

    def get(self, request, *args, **kwargs):
        """Get access request list."""
        domain = request.GET.get('domain', '')
        print(f'Url :"{request.build_absolute_uri()}"')
        if domain:
            domain = remove_www(domain.split(':')[0])
        domain_model = get_tenant_domain_model()
        try:
            tenant = domain_model.objects.select_related(
                'tenant'
            ).get(domain=domain)
            schema_name = tenant.schema_name
        except domain_model.DoesNotExist:
            return HttpResponseForbidden(f'{domain} does not exist')
        print(f'Schema name :"{schema_name}"')
        return Response(schema_name, headers={'Schema': schema_name})
