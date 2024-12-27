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
__date__ = '13/06/2023'
__copyright__ = ('Copyright 2023, Unicef')

from urllib import parse

import requests
from django.http import HttpResponseBadRequest, HttpResponse
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

from core.utils import set_query_parameter, parse_url
from geosight.data.models.arcgis import ArcgisConfig


class ProxyView:
    """Proxy view for Arcgis API."""

    key = 'url'

    def __init__(self, request):
        """Initialize the proxy view."""
        self.request = request

    def proxy_request(
            self, url, username=None, password=None,
            basic_auth=None
    ):
        """Fetch data."""
        request = self.request
        method = request.method.upper()

        # Prepare headers
        headers = {}
        if basic_auth:
            headers["Authorization"] = f"Basic {basic_auth}"

        # Add the Content-Type header if available
        content_type = request.headers.get('Content-Type')
        if content_type:
            headers["Content-Type"] = content_type

        if method == "GET":
            if username and password:
                response = requests.get(
                    url, auth=(username, password),
                    headers=headers
                )
            else:
                response = requests.get(url, headers=headers)
        elif method == "POST":
            data = request.body
            if username and password:
                response = requests.post(
                    url,
                    auth=(username, password),
                    headers=headers,
                    data=data
                )
            else:
                response = requests.post(url, headers=headers, data=data)
        else:
            return HttpResponse("Method not allowed", status=405)

        django_response = HttpResponse(
            content=response.content,
            status=response.status_code,
            content_type=response.headers.get('Content-Type', 'text/plain')
            # Default to text/plain if Content-Type is missing
        )
        return django_response

    def get_url(self, request, pk):
        """Return the url to the arcgis."""
        config = get_object_or_404(ArcgisConfig, pk=pk)
        url = request.GET.get(self.key, None)
        if not url:
            raise ValueError(f'{self.key} is required')

        # Check if config host same with host
        config_host, _, _ = parse_url(
            parse.unquote(config.generate_token_url)
        )
        input_url = parse.unquote(url)

        # Create url of arcgis
        params = {}
        for key, value in request.GET.items():
            if key != self.key:
                params[key] = value
        params['token'] = config.token_val

        url = set_query_parameter(input_url, params)
        url_host, path, params = parse_url(parse.unquote(url))
        if config_host != url_host:
            raise ValueError(
                'Url host does not match with config'
            )

        # Just allow FeatureServer or MapServer
        if all(c not in path for c in ['/FeatureServer/', '/MapServer/']):
            return ValueError(
                'Just allow FeatureServer or MapServer'
            )
        return url


@method_decorator(csrf_exempt, name='dispatch')
def arcgis_proxy_request(request, pk):
    proxy = ProxyView(request)
    try:
        url = proxy.get_url(request, pk)
    except ValueError as e:
        return HttpResponseBadRequest(f'{e}')
    return proxy.proxy_request(url)
