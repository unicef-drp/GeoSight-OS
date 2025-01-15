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
__date__ = '24/10/2023'
__copyright__ = ('Copyright 2023, Unicef')

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.db import connection, connections
from django.db.utils import ProgrammingError
from django.test import TestCase as DjangoTestCase
from django.test.client import MULTIPART_CONTENT
from psycopg2.errors import DuplicateSchema

if settings.TENANTS_ENABLED:
    from django_tenants.test.client import TenantClient as Client
    from django_tenants.utils import (
        get_public_schema_name
    )
    from geosight.tenants.utils import create_tenant
else:
    from django.test.client import Client

User = get_user_model()


class DjangoTenantData:
    """Object contains domain and schema."""

    def __init__(self, tenant_schema, tenant_domain, is_primary=False):
        """Initialize the object."""
        self.tenant_schema = tenant_schema
        self.tenant_domain = tenant_domain
        self.is_primary = is_primary


class DjangoTenantObj:
    """Object contains domain and schema of data."""

    def __init__(self, tenant, domain):
        """Initialize the object."""
        self.tenant = tenant
        self.domain = domain


class _BaseClientTestCase:
    """Base client test case."""

    def test_client(self):
        """Return client of test."""
        if settings.TENANTS_ENABLED:
            try:
                return Client(self.tenant)
            except AttributeError:
                return Client()
        else:
            return Client()


if settings.TENANTS_ENABLED:
    class TestCase(_BaseClientTestCase, DjangoTestCase):
        """Tenant test case updated."""

        tenant_data = [
            DjangoTenantData(
                'public', 'public', is_primary=True
            ),
            DjangoTenantData(
                'test2', 'test.2.com'
            ),
        ]
        tenant_obj = []

        def change_public_tenant(self):
            """Change to public tenant."""
            self.set_tenant_connection(self.tenant_obj[0].tenant)

        def change_second_tenant(self):
            """Change to second tenant."""
            self.set_tenant_connection(self.tenant_obj[1].tenant)

        @property
        def tenant(self):
            """Return first tenant object."""
            return connection.get_tenant()

        @classmethod
        def setUpTenant(cls, tenant_data: DjangoTenantData):
            """Do setup tenant and domain."""
            tenant_schema = tenant_data.tenant_schema
            tenant_domain = tenant_data.tenant_domain
            is_primary = tenant_data.is_primary
            tenant, domain = create_tenant(
                tenant_schema, tenant_domain, is_primary=is_primary
            )

            # TODO:
            # Create schema for gis cloud native
            # it is not being created automatically on create layer
            connection = connections['default']
            cursor = connection.cursor()
            try:
                cursor.execute(f'CREATE SCHEMA "{tenant_schema}_gis"')
            except (DuplicateSchema, ProgrammingError):
                pass
            finally:
                cursor.close()

            return tenant, domain

        @classmethod
        def setUpClass(cls):
            """Set up class of test."""
            for init in cls.tenant_data:
                tenant, domain = cls.setUpTenant(init)
                cls.tenant_obj.append(DjangoTenantObj(tenant, domain))
            tenant = cls.tenant_obj[1].tenant
            cls.set_tenant_connection(tenant)

        @classmethod
        def tearDownClass(cls):
            """Tear down class of test."""
            connection.set_schema_to_public()

        @classmethod
        def add_allowed_test_domain(cls, tenant_domain):
            """Add allowed domain to ALLOWED_HOSTS."""
            if tenant_domain not in settings.ALLOWED_HOSTS:
                settings.ALLOWED_HOSTS += [tenant_domain]

        @classmethod
        def remove_allowed_test_domain(cls, tenant_domain):
            """Remove allowed domain to ALLOWED_HOSTS."""
            if tenant_domain in settings.ALLOWED_HOSTS:
                settings.ALLOWED_HOSTS.remove(tenant_domain)

        @classmethod
        def sync_shared(cls):
            """Migrate the schema."""
            call_command(
                'migrate_schemas',
                schema_name=get_public_schema_name(),
                interactive=False,
                verbosity=0
            )

        @classmethod
        def set_tenant_connection(cls, tenant):
            """Set tenant connection."""
            connection.set_tenant(tenant)

        @property
        def tenants(self):
            """Return tenants in list."""
            return [tenant_obj.tenant for tenant_obj in self.tenant_obj]
else:
    class TestCase(_BaseClientTestCase, DjangoTestCase):
        """Tenant test case updated."""

        pass


class APITestCase(TestCase):
    """Base of test."""

    JSON_CONTENT = 'application/json'
    password = 'password'

    def assertRequestGetView(self, url, code, user=None):
        """Assert request GET view with code."""
        client = self.test_client()
        if user:
            client.login(username=user.username, password=self.password)
        response = client.get(url)
        self.assertEquals(response.status_code, code)
        return response

    def assertRequestPostView(
            self, url, code, data, user=None,
            content_type=MULTIPART_CONTENT, follow=False
    ):
        """Assert request POST view with code."""
        client = self.test_client()
        if user:
            client.login(username=user.username, password=self.password)
        response = client.post(
            url, data=data, content_type=content_type, follow=follow
        )
        self.assertEquals(response.status_code, code)
        return response

    def assertRequestPutView(
            self, url, code, data, user=None,
            content_type="application/json"
    ):
        """Assert request POST view with code."""
        client = self.test_client()
        if user:
            client.login(username=user.username, password=self.password)
        response = client.put(url, data=data, content_type=content_type)
        self.assertEquals(response.status_code, code)
        return response

    def assertRequestPatchView(
            self, url, code, data, user=None,
            content_type="application/json"
    ):
        """Assert request POST view with code."""
        client = self.test_client()
        if user:
            client.login(username=user.username, password=self.password)
        response = client.patch(url, data=data, content_type=content_type)
        self.assertEquals(response.status_code, code)
        return response

    def assertRequestDeleteView(
            self, url, code, user=None, data=None,
            content_type="application/json"
    ):
        """Assert request DELETE view with code."""
        client = self.test_client()
        if user:
            client.login(username=user.username, password=self.password)
        response = client.delete(url, data=data, content_type=content_type)
        self.assertEquals(response.status_code, code)
        return response

    def assertResponseContainsPaginatedList(
            self, response, validation_function, *resources
    ):
        """
        Assert GET response against resources.

        Assert the GET response contains a JSON array with exactly the same
         elements representing the given resources, in any order.

        :param response: GET response
        :param validation_function: A function receiving a json object from
         the response and a resource
         and returning a boolean determining whether the json object represents
         the resource or not.
        """
        assert response.status_code == 200
        results = response.json().get('results')

        assert len(results) == len(resources)
        for resource in resources:
            assert any(validation_function(json_obj, resource)
                       for json_obj in results)
