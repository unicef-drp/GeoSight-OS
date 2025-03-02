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
import random
import string
import uuid
from urllib.parse import urlparse, parse_qsl, urlencode, urlunparse

from django.conf import settings
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


def parse_url(url):
    """Parse url."""
    parsed_url = urlparse(url)
    params_dict = dict(parse_qsl(parsed_url.query))
    return parsed_url.netloc, parsed_url.path, params_dict


def set_query_parameter(url, params):
    """Given a URL and replace a query parameter and return modified URL."""
    url_parse = urlparse(url)
    query = url_parse.query
    url_dict = dict(parse_qsl(query))
    url_dict.update(params)
    url_new_query = urlencode(url_dict)
    url_parse = url_parse._replace(query=url_new_query)
    return urlunparse(url_parse)


def do_random(
        size=15,
        chars=string.ascii_uppercase + string.ascii_lowercase + string.digits
):
    """Do random of text."""
    return ''.join(random.choice(chars) for _ in range(size))


def create_superuser(
        tenant=None, admin_password=None, admin_email=None
):
    """Create superuser."""
    admin_username = os.getenv('ADMIN_USERNAME')

    # Check if tenant not public, random the password
    if not admin_password:
        admin_password = os.getenv('ADMIN_PASSWORD')
    if tenant and settings.TENANTS_ENABLED:
        from django_tenants.utils import get_public_schema_name
        if tenant.schema_name != get_public_schema_name():
            admin_password = do_random()
            if tenant.responder_email:
                admin_email = tenant.responder_email
    if not admin_email:
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
        superuser.set_password(admin_password)
        print(f'superuser successfully created with password {admin_password}')

        # TODO: Send email to user for password to responder_email of Tenant
    superuser.save()


def child_classes(Class):
    """Return child classes."""
    # If has subclasses
    if not len(Class.__subclasses__()):
        return [Class]

    # If has subclasses
    classes = []
    for _class in Class.__subclasses__():
        if len(_class.__subclasses__()):
            for child in _class.__subclasses__():
                classes += child_classes(child)
        else:
            classes.append(_class)
    return classes


class temp_disconnect_signal(object):
    """Temporarily disconnect a model from a signal."""

    def __init__(self, signal, receiver, sender):
        """Initialise the temporary disconnect signal."""
        self.signal = signal
        self.receiver = receiver
        self.sender = sender

    def __enter__(self):
        """Enter the temporary disconnect signal."""
        self.signal.disconnect(
            receiver=self.receiver,
            sender=self.sender
        )

    def __exit__(self, type, value, traceback):
        """Exit the temporary disconnect signal."""
        self.signal.connect(
            receiver=self.receiver,
            sender=self.sender
        )


def pg_value(value, attr=None):
    """Return pg value."""
    if attr:
        return f"'{getattr(value, attr)}'" if value else "NULL"
    return f"'{value}'" if value else "NULL"
