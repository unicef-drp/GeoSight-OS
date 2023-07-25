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

import logging

import requests
from django.conf import settings
from django.http import HttpResponseRedirect
from django.shortcuts import resolve_url

from azure_auth.configuration import get_config_instance
from azure_auth.handlers import AzureAuthHandler
from azure_auth.views import azure_auth_callback
from core.models.preferences import SitePreferences
from .exceptions import InvalidGeoRepoAuthentication

logger = logging.getLogger(__name__)


def georepo_azure_auth_callback(request):
    """Callback/Reply URL that is called from code grant flow."""
    client_id = AzureAuthHandler.find_stored_client_id_by_state(request)
    if settings.USE_GEOREPO_B2C and \
            client_id == settings.GEOREPO_AZURE_AUTH['CLIENT_ID']:
        return _azure_auth_georepo_callback(request)
    return azure_auth_callback(request)


def azure_auth_georepo_login(request):
    """Redirect user to GeoRepo Azure B2C authentication page."""
    config = get_config_instance(settings.GEOREPO_AZURE_AUTH)
    return HttpResponseRedirect(
        AzureAuthHandler(request, config).get_auth_uri()
    )


def georepo_authenticate(request, token):
    """
    Check token againts GeoRepo API.

    This is to handle when GeoSight User has not been created
    in GeoRepo side.
    """
    # call GeoRepo module list API
    pref = SitePreferences.preferences()
    if not pref.georepo_url:
        raise InvalidGeoRepoAuthentication()
    if 'access_token' not in token:
        raise InvalidGeoRepoAuthentication()
    access_token = token['access_token']
    georepo_url = pref.georepo_url.strip('/')
    module_list_url = (
        f'{georepo_url}/search/module/list/'
        '?cached=False'
    )
    response = requests.get(
        module_list_url,
        headers={
            'Authorization': f'Bearer {access_token}'
        }
    )
    if response.status_code != 200:
        raise InvalidGeoRepoAuthentication(
            'You are not allowed to access GeoRepo!'
        )


def _azure_auth_georepo_callback(request):
    """Process authentication for GeoRepo."""
    config = get_config_instance(settings.GEOREPO_AZURE_AUTH)
    handler = AzureAuthHandler(request, config)
    next_uri = handler.get_auth_flow_next_uri()
    # page to handle GeoRepo invalid page
    redirect_path = request.build_absolute_uri(
        resolve_url(settings.GEOREPO_USER_NO_ACCESS_URL)
    )
    if next_uri:
        redirect_path += f'?next={next_uri}'
    output = HttpResponseRedirect(
        handler.get_logout_uri(redirect_path)
    )
    try:
        token = handler.get_token_from_flow()
        # check token against GeoRepo API
        # this is to ensure that the user has been registered on GeoRepo side
        georepo_authenticate(request, token)
        redirect_uri = next_uri or settings.LOGIN_REDIRECT_URL
        output = HttpResponseRedirect(redirect_uri)
    except Exception as e:
        logger.exception(e)
        handler.flush_session_cache()
    # TODO: after logout redirection, check whether GeoRepo still has access
    logger.debug("_azure_auth_georepo_callback: %s", output)
    return output
