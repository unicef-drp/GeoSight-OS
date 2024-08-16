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
__date__ = '16/08/2024'
__copyright__ = ('Copyright 2023, Unicef')

from urllib import parse

import responses
from django.contrib.auth import get_user_model
from django.test.client import Client
from django.test.testcases import TestCase
from django.urls import reverse

from core.tests.base_test_patch_responses import (
    BaseTestWithPatchResponses, PatchReqeust
)
from geosight.data.models.arcgis import ArcgisConfig

User = get_user_model()


class ARCGISProxyApiTest(TestCase, BaseTestWithPatchResponses):
    """Test for Arcgis Proxy api."""

    token = 'ThisIsToken'
    mock_requests = [
        PatchReqeust(
            'https://arcgis.example.test/portal/sharing/generateToken',
            response={
                'token': token,
                'expires': 3600000,
            },
            request_method='POST'
        ),
        PatchReqeust(
            'https://arcgis.example.test/FeatureServer/?test=true&token=ThisIsToken',
            response={
                'result': 'OK'
            },
            request_method='GET'
        )
    ]

    def setUp(self):
        """To setup test."""
        self.config = ArcgisConfig.objects.create(
            name='arcgis',
            generate_token_url=(
                'https://arcgis.example.test/portal/sharing/generateToken'
            ),
            username='test',
            password='test',
        )

        self.url = reverse(
            'arcgis-config-proxy', kwargs={'pk': self.config.id}
        )

    @responses.activate
    def test_token_generated(self):
        """Test if token generated."""
        self.init_mock_requests()
        self.config.generate_token()
        self.assertEqual(self.config.token_val, self.token)

    @responses.activate
    def test_url_not_have_key(self):
        """Test if host not same."""
        client = Client()
        response = client.get(self.url)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.content.decode('utf-8'),
            'url is required'
        )

    @responses.activate
    def test_url_not_same_host(self):
        """Test if host not same."""
        client = Client()
        _url_param = parse.quote('https://arcgis.example.com/test/?test=true')
        response = client.get(self.url + f'?url={_url_param}')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.content.decode('utf-8'),
            'Url host does not match with config'
        )

    @responses.activate
    def test_url_not_allowed_feature_map_server(self):
        """Test if host not same."""
        client = Client()
        _url_param = parse.quote('https://arcgis.example.test/test/?test=true')
        response = client.get(self.url + f'?url={_url_param}')
        self.assertEqual(response.status_code, 400)
        self.assertTrue(
            'FeatureServer' in response.content.decode('utf-8')
        )
        _url_param = parse.quote(
            'https://arcgis.example.test/test/?test=true&test=/FeatureServer/'
        )
        response = client.get(self.url + f'?url={_url_param}')
        self.assertEqual(response.status_code, 400)
        self.assertTrue(
            'FeatureServer' in response.content.decode('utf-8')
        )

    @responses.activate
    def test_url_allowed_ok(self):
        """Test if host not same."""
        self.init_mock_requests()
        self.config.generate_token()
        client = Client()
        _url_param = parse.quote(
            'https://arcgis.example.test/FeatureServer/?test=true'
        )
        response = client.get(self.url + f'?url={_url_param}')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['result'], 'OK')
