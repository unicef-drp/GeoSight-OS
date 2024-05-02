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
__date__ = '02/05/2024'
__copyright__ = ('Copyright 2023, Unicef')

from django.db import models
from django_tenants.models import TenantMixin, DomainMixin
from django_tenants.utils import tenant_context

from core.utils import create_superuser


class Client(TenantMixin):
    """Client name for the tenant."""

    auto_create_schema = True
    name = models.CharField(max_length=100)
    created_on = models.DateField(auto_now_add=True)

    def __str__(self):
        return self.name

    def save(self, verbosity=1, *args, **kwargs):
        """Save client."""
        super().save(verbosity=verbosity, *args, **kwargs)
        self.create_superuser()

    def create_superuser(self):
        """Create superuser for this tenant."""
        with tenant_context(self):
            create_superuser(self)


class Domain(DomainMixin):
    """Client name for the tenant."""

    is_primary = models.BooleanField(default=False, db_index=True)

    @property
    def schema_name(self):
        """Return schema name of domain."""
        return self.tenant.schema_name
