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
from django.db import connection
from django.test import TestCase
from django.test.client import MULTIPART_CONTENT
from django_tenants.test.client import TenantClient
from django_tenants.utils import (
    get_tenant_model, get_tenant_domain_model, get_public_schema_name
)

User = get_user_model()


class DjangoTenantData:
    """Object contains domain and schema."""

    def __init__(self, tenant_schema, tenant_domain):
        """Initialize the object."""
        self.tenant_schema = tenant_schema
        self.tenant_domain = tenant_domain


class DjangoTenantObj:
    """Object contains domain and schema of data."""

    def __init__(self, tenant, domain):
        """Initialize the object."""
        self.tenant = tenant
        self.domain = domain


class TenantTestCase(TestCase):
    """Tenant test case updated."""
    tenant_data = [
        DjangoTenantData('test1', 'test.1.com'),
        DjangoTenantData('test2', 'test.2.com'),
    ]
    tenant_obj = []

    @property
    def tenant(self):
        return self.tenant_obj[0].tenant

    @property
    def domain(self):
        return self.tenant_obj[0].domain

    @classmethod
    def setUpTenant(cls, tenant_schema, tenant_domain):
        """Setup tenant and domain."""
        try:
            tenant = get_tenant_model().objects.get(
                schema_name=tenant_schema
            )
        except get_tenant_model().DoesNotExist:
            cls.sync_shared()
            cls.add_allowed_test_domain(tenant_domain)
            tenant = get_tenant_model()(
                schema_name=tenant_schema
            )
            tenant.save(verbosity=cls.get_verbosity())

        # Set up domain
        domain, _ = get_tenant_domain_model().objects.get_or_create(
            tenant=tenant, domain=tenant_domain
        )

        return tenant, domain

    @classmethod
    def setUpClass(cls):
        for init in cls.tenant_data:
            tenant, domain = cls.setUpTenant(
                init.tenant_schema, init.tenant_domain
            )
            cls.tenant_obj.append(DjangoTenantObj(tenant, domain))
        tenant = cls.tenant_obj[0].tenant
        connection.set_tenant(tenant)

    @classmethod
    def tearDownClass(cls):
        connection.set_schema_to_public()

    @classmethod
    def get_verbosity(cls):
        return 0

    @classmethod
    def add_allowed_test_domain(cls, tenant_domain):
        if tenant_domain not in settings.ALLOWED_HOSTS:
            settings.ALLOWED_HOSTS += [tenant_domain]

    @classmethod
    def remove_allowed_test_domain(cls, tenant_domain):
        if tenant_domain in settings.ALLOWED_HOSTS:
            settings.ALLOWED_HOSTS.remove(tenant_domain)

    @classmethod
    def sync_shared(cls):
        call_command(
            'migrate_schemas',
            schema_name=get_public_schema_name(),
            interactive=False,
            verbosity=0
        )


class BaseTest:
    """Base of test."""

    JSON_CONTENT = 'application/json'
    password = 'password'

    @property
    def tenant_client(self):
        """Return client of test."""
        return TenantClient(self.tenant)

    def assertRequestGetView(self, url, code, user=None):
        """Assert request GET view with code."""
        client = self.tenant_client
        if user:
            client.login(username=user.username, password=self.password)
        response = client.get(url)
        self.assertEquals(response.status_code, code)
        return response

    def assertRequestPostView(
            self, url, code, data, user=None, content_type=MULTIPART_CONTENT
    ):
        """Assert request POST view with code."""
        client = self.tenant_client
        if user:
            client.login(username=user.username, password=self.password)
        response = client.post(url, data=data, content_type=content_type)
        self.assertEquals(response.status_code, code)
        return response

    def assertRequestPutView(
            self, url, code, data, user=None, content_type=MULTIPART_CONTENT
    ):
        """Assert request POST view with code."""
        client = self.tenant_client
        if user:
            client.login(username=user.username, password=self.password)
        response = client.put(url, data=data, content_type=content_type)
        self.assertEquals(response.status_code, code)
        return response

    def assertRequestPatchView(
            self, url, code, data, user=None, content_type=MULTIPART_CONTENT
    ):
        """Assert request POST view with code."""
        client = self.tenant_client
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
        client = self.tenant_client
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
