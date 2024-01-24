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
from django.test.client import Client, MULTIPART_CONTENT

User = get_user_model()


class BaseTest:
    """Base of test."""

    JSON_CONTENT = 'application/json'
    password = 'password'

    def assertRequestGetView(self, url, code, user=None):
        """Assert request GET view with code."""
        client = Client()
        if user:
            client.login(username=user.username, password=self.password)
        response = client.get(url)
        self.assertEquals(response.status_code, code)
        return response

    def assertRequestPostView(
            self, url, code, data, user=None, content_type=MULTIPART_CONTENT
    ):
        """Assert request POST view with code."""
        client = Client()
        if user:
            client.login(username=user.username, password=self.password)
        response = client.post(url, data=data, content_type=content_type)
        self.assertEquals(response.status_code, code)
        return response

    def assertRequestPutView(
            self, url, code, data, user=None, content_type=MULTIPART_CONTENT
    ):
        """Assert request POST view with code."""
        client = Client()
        if user:
            client.login(username=user.username, password=self.password)
        response = client.put(url, data=data, content_type=content_type)
        self.assertEquals(response.status_code, code)
        return response

    def assertRequestPatchView(
            self, url, code, data, user=None, content_type=MULTIPART_CONTENT
    ):
        """Assert request POST view with code."""
        client = Client()
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
        client = Client()
        if user:
            client.login(username=user.username, password=self.password)
        response = client.delete(url, data=data, content_type=content_type)
        self.assertEquals(response.status_code, code)
        return response

    def assertResponseContainsList(self, response, validation_function, *resources):
        """
        Assert the GET response contains a JSON array with exactly the same elements representing
         the given resources, in any order.

        :param response: GET response
        :param validation_function: A function receiving a json object from the response and a resource
        and returning a boolean determining whether the json object represents the resource or not.
        """
        assert response.status_code == 200
        json = response.json()

        assert len(json) == len(resources)
        for resource in resources:
            assert any(validation_function(json_obj, resource) for json_obj in json)
