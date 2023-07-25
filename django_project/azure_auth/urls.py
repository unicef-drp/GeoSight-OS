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

from django.urls import path

from azure_auth.views import (
    azure_auth_callback,
    azure_auth_login,
    azure_auth_logout,
    azure_auth_redirect
)

app_name = "azure_auth"
urlpatterns = [
    path("azure-auth/login", azure_auth_login, name="login"),
    path("azure-auth/logout", azure_auth_logout, name="logout"),
    path("signin-oidc", azure_auth_callback, name="callback"),
    path("redirect", azure_auth_redirect, name="redirect")
]
