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

from django.contrib.auth import get_user_model
from django.db import connection
from django.test.client import MULTIPART_CONTENT
from django_tenants.test.cases import (
    TenantTestCase as DjangoTenantTestCase,
    get_tenant_model,
    get_tenant_domain_model
)
from django_tenants.test.client import TenantClient

User = get_user_model()


class TenantTestCase(DjangoTenantTestCase):
    """Tenant test case."""

    @classmethod
    def setUpClass(cls):
        """Initiate tenant and domain for test."""
        try:
            cls.tenant = get_tenant_model().objects.get(
                schema_name=cls.get_test_schema_name()
            )
        except get_tenant_model().DoesNotExist:
            cls.sync_shared()
            cls.add_allowed_test_domain()
            cls.tenant = get_tenant_model()(
                schema_name=cls.get_test_schema_name()
            )
            cls.setup_tenant(cls.tenant)
            cls.tenant.save(verbosity=cls.get_verbosity())

        # Set up domain
        tenant_domain = cls.get_test_tenant_domain()
        try:
            cls.domain = get_tenant_domain_model().objects.get(
                tenant=cls.tenant, domain=tenant_domain
            )
        except get_tenant_domain_model().DoesNotExist:
            cls.domain = get_tenant_domain_model()(
                tenant=cls.tenant, domain=tenant_domain
            )
            cls.setup_domain(cls.domain)
            cls.domain.save()

        connection.set_tenant(cls.tenant)

    @classmethod
    def tearDownClass(cls):
        """Tear down function."""
        connection.set_schema_to_public()


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
