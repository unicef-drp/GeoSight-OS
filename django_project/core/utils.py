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

import base64
import gzip
import os
import random
import string
import uuid
from urllib.parse import urlparse, parse_qsl, urlencode, urlunparse

from django.conf import settings
from django.contrib.auth import get_user_model


def string_is_true(string: str):
    """Return whether a string represents a truthy value.

    :param string: The value to test.
    :type string: str
    :returns: True if the string matches a truthy token (y, yes, true, etc.).
    :rtype: bool
    """
    return str(string).lower() in ['y', 'yes', 't', 'true', 'ok', 'on', True]


def is_valid_uuid(value):
    """Check whether a value is a valid UUID.

    :param value: The value to test.
    :type value: any
    :returns: True if the value can be parsed as a UUID, False otherwise.
    :rtype: bool
    """
    try:
        uuid.UUID(str(value))
        return True
    except ValueError:
        return False


def parse_url(url):
    """Parse a URL into its host, path, and query parameters.

    :param url: The URL to parse.
    :type url: str
    :returns: A tuple of (netloc, path, query_params_dict).
    :rtype: tuple[str, str, dict]
    """
    parsed_url = urlparse(url)
    params_dict = dict(parse_qsl(parsed_url.query))
    return parsed_url.netloc, parsed_url.path, params_dict


def set_query_parameter(url, params):
    """Replace or add query parameters in a URL and return the modified URL.

    :param url: The original URL.
    :type url: str
    :param params: Mapping of parameter names to new values.
    :type params: dict
    :returns: The URL with updated query parameters.
    :rtype: str
    """
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
    """Generate a random string of the given length from the given charset.

    :param size: Number of characters to generate.
    :type size: int
    :param chars: Pool of characters to draw from.
    :type chars: str
    :returns: A random string of the requested length.
    :rtype: str
    """
    return ''.join(random.choice(chars) for _ in range(size))


def create_superuser(
        tenant=None, admin_password=None, admin_email=None
):
    """Create or update the superuser account for the given tenant.

    :param tenant: The tenant for which the superuser is created. If None,
        targets the public schema.
    :type tenant: object or None
    :param admin_password: Password to set. Falls back to the
        ``ADMIN_PASSWORD`` environment variable if not provided.
    :type admin_password: str or None
    :param admin_email: Email address for the superuser. Falls back to the
        ``ADMIN_EMAIL`` environment variable if not provided.
    :type admin_email: str or None
    """
    from core.models.profile import Profile, ROLES
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
    profile, _ = Profile.objects.get_or_create(user=superuser)
    profile.role = ROLES.SUPER_ADMIN.name
    profile.save()


def child_classes(Class):
    """Return all leaf subclasses of the given class.

    :param Class: The class whose subclass tree is traversed.
    :type Class: type
    :returns: List of leaf classes (classes with no further subclasses).
    :rtype: list[type]
    """
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

    def __init__(self, signal, receiver, sender):  # noqa: DOC101, DOC103
        """Store the signal, receiver, and sender to reconnect on exit.

        :param signal: The Django signal to disconnect.
        :type signal: django.dispatch.Signal
        :param receiver: The receiver function to disconnect.
        :type receiver: callable
        :param sender: The model or sender to disconnect from.
        :type sender: type or None
        """
        self.signal = signal
        self.receiver = receiver
        self.sender = sender

    def __enter__(self):
        """Disconnect the signal on context entry."""
        self.signal.disconnect(
            receiver=self.receiver,
            sender=self.sender
        )

    def __exit__(self, type, value, traceback):
        """Reconnect the signal on context exit.

        :param type: Exception type, if any.
        :type type: type or None
        :param value: Exception value, if any.
        :type value: BaseException or None
        :param traceback: Traceback, if any.
        :type traceback: types.TracebackType or None
        """
        self.signal.connect(
            receiver=self.receiver,
            sender=self.sender
        )


def pg_value(value, attr=None):
    """Format a value as a PostgreSQL-safe string literal or NULL.

    :param value: The value to format.
    :type value: any
    :param attr: Optional attribute name to extract from ``value`` before
        formatting.
    :type attr: str or None
    :returns: A single-quoted, escaped string literal, or ``'NULL'`` if
        ``value`` is falsy.
    :rtype: str
    """
    set_value = value
    if attr and value:
        set_value = getattr(value, attr)
    try:
        set_value = set_value.replace("'", "''")
    except Exception:
        pass
    return f"'{set_value}'" if value else "NULL"


def compress_text(text):
    """Compress a UTF-8 string with gzip and return it as a base64 string.

    :param text: The text to compress.
    :type text: str
    :returns: Base64-encoded gzip-compressed representation of the input.
    :rtype: str
    """
    compressed = gzip.compress(text.encode('utf-8'))
    return base64.b64encode(compressed).decode('utf-8')


def decompress_text(compressed_text):
    """Decompress a base64-encoded gzip string back to plain text.

    :param compressed_text: The base64-encoded gzip data to decompress.
    :type compressed_text: str
    :returns: The original uncompressed UTF-8 string.
    :rtype: str
    """
    compressed = base64.b64decode(compressed_text)
    return gzip.decompress(compressed).decode('utf-8')
