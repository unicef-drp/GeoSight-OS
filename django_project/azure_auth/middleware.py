# coding=utf-8
"""
GeoSight is UNICEF’s geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""
__author__ = 'danang@kartoza.com'
__date__ = '26/06/2023'
__copyright__ = ('Copyright 2023, Unicef')

from django.contrib.auth import logout
from django.shortcuts import redirect
from django.urls import reverse

from .configuration import AzureAuthConfig
from .handlers import AzureAuthHandler


class AzureAuthMiddleware:
    """Middleware class to check for valid Azure B2C Token."""

    def __init__(self, get_response):
        """Initialize class with get_response function."""
        self.get_response = get_response

    def __call__(self, request):
        """Check whether there is valid token."""
        public_urls = [reverse(view_name) for
                       view_name in AzureAuthConfig.PUBLIC_URLS]
        if request.path_info in public_urls:
            return self.get_response(request)
        if AzureAuthHandler(request).get_token_from_cache():
            # If the user is authenticated
            if request.user.is_authenticated:
                return self.get_response(request)
        # if token auth is failed, then logout django session
        logout(request)
        # redirect to django login
        return redirect("login")
