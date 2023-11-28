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

import requests
from django.http import HttpResponseBadRequest, HttpResponse
from rest_framework.views import APIView


class ProxyView(APIView):
    """Proxy API for returning outside url."""

    def fetch(self, url, username=None, password=None, basic_auth=None):
        """Fetch data."""
        if username and password:
            response = requests.get(url, auth=(username, password))
        elif basic_auth:
            response = requests.get(url, headers={
                "Authorization": f"Basic {basic_auth}"})
        else:
            response = requests.get(url)

        django_response = HttpResponse(
            content=response.content,
            status=response.status_code,
            content_type=response.headers['Content-Type']
        )
        return django_response

    def get(self, request):
        """GET API."""
        url = request.GET.get('url', None)
        if not url:
            return HttpResponseBadRequest('url is required')
        return self.fetch(
            url,
            username=request.GET.get('username', None),
            password=request.GET.get('password', None),
            basic_auth=request.GET.get('basic_auth', None)
        )
