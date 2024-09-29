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

from django_tenants.utils import (
    get_tenant_model, get_public_schema_name, get_tenant_domain_model
)


def is_public_tenant(request):
    """Return is public tenant from request."""
    current_tenant = get_tenant_model().objects.get(
        schema_name=request.tenant.schema_name
    )
    return current_tenant.schema_name == get_public_schema_name()


def create_tenant(
        tenant_schema, tenant_domain, tenant_email='', is_primary=False
):
    """Create new tenant."""
    tenant, _ = get_tenant_model().objects.get_or_create(
        schema_name=tenant_schema
    )
    tenant.name = tenant_schema
    tenant.responder_email = tenant_email
    tenant.save()

    # Set up domain
    domain, _ = get_tenant_domain_model().objects.get_or_create(
        tenant=tenant, domain=tenant_domain
    )
    domain.is_primary = is_primary
    domain.save()
    return tenant, domain
