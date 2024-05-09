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

import os
import uuid
from urllib.parse import urlparse, parse_qsl, urlencode, urlunparse

from django.contrib.auth import get_user_model


def string_is_true(string: str):
    """Return is true or false of string contains true like string."""
    return str(string).lower() in ['y', 'yes', 't', 'true', 'ok', 'on', True]


def is_valid_uuid(value):
    """Check if sting is uuid."""
    try:
        uuid.UUID(str(value))
        return True
    except ValueError:
        return False


def set_query_parameter(url, params):
    """Given a URL and replace a query parameter and return modified URL."""
    url_parse = urlparse(url)
    query = url_parse.query
    url_dict = dict(parse_qsl(query))
    url_dict.update(params)
    url_new_query = urlencode(url_dict)
    url_parse = url_parse._replace(query=url_new_query)
    return urlunparse(url_parse)


def create_superuser(tenant=None):
    """Create superuser."""
    # Getting the secrets
    admin_username = os.getenv('ADMIN_USERNAME')
    admin_password = os.getenv('ADMIN_PASSWORD')
    admin_email = os.getenv('ADMIN_EMAIL')

    print(
        f'Creating/updating superuser for '
        f'{tenant.schema_name if tenant else "public"}'
    )
    USE_AZURE = os.getenv('AZURE_B2C_CLIENT_ID', '') not in ['', "''"]
    if USE_AZURE:
        admin_email = os.getenv('B2C_ADMIN_EMAIL', admin_email)
        admin_username = os.getenv('B2C_ADMIN_EMAIL', admin_username)
    try:
        superuser = get_user_model().objects.get(username=admin_username)
        superuser.is_active = True
        superuser.email = admin_email
        superuser.save()
        print('superuser successfully updated')
    except get_user_model().DoesNotExist:
        superuser = get_user_model().objects.create_superuser(
            admin_username,
            admin_email,
        )
        print('superuser successfully created')

    superuser.set_password(admin_password)
    superuser.save()
