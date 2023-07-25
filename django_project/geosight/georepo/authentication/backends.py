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

from django.conf import settings
from django.contrib.auth import get_user_model

from azure_auth.configuration import get_config_instance
from azure_auth.handlers import AzureAuthHandler

UserModel = get_user_model()

logger = logging.getLogger(__name__)


def fetch_georepo_token(request):
    """Fetch GeoRepo access token."""
    if settings.USE_GEOREPO_B2C:
        config = get_config_instance(settings.GEOREPO_AZURE_AUTH)
        token = AzureAuthHandler(request, config).get_token_from_cache()
        return (
            token['access_token'] if
            token and 'access_token' in token else None
        )
    else:
        return None
