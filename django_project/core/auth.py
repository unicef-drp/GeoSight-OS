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
__date__ = '24/10/2023'
__copyright__ = ('Copyright 2023, Unicef')

import jwt
from django.utils.translation import gettext_lazy as _
from knox.auth import TokenAuthentication
from rest_framework import authentication

from core.models.api_key import ApiKey


class CustomTokenAuthentication(TokenAuthentication):
    """Customized token based authentication.

    Clients should authenticate by passing the token key in the url.
    For example:
        &token={token_key}
        &geosight_user_key={user_email}
    """

    def test_jwt_token(self, token):
        """Return jwt token."""
        try:
            jwt.get_unverified_header(token)
            return True
        except Exception:
            pass
        return False

    def test_user_key(self, user, user_key):
        """Test the user key a.k.a email user."""
        if user.email != user_key:
            msg = _('Invalid email!.')
            raise authentication.exceptions.AuthenticationFailed(msg)

    def get_user_key_param(self, request):
        """Get user key from header."""
        url_string = request.META['QUERY_STRING']
        if url_string:
            params = url_string.split('&')
            user_keys = [
                x for x in params if
                x.startswith('geosight_user_key=')
            ]
            return (
                user_keys[0].replace('geosight_user_key=', '') if
                user_keys else ''
            )
        return ''

    def authenticate_credentials(self, key):
        """Autehnticate credential."""
        user, token = (
            super(CustomTokenAuthentication, self).
            authenticate_credentials(key)
        )
        # check flag in TokenDetail
        try:
            if not token.apikey.is_active:
                raise authentication.exceptions. \
                    AuthenticationFailed(_('Invalid token.'))
        except ApiKey.DoesNotExist:
            raise authentication.exceptions. \
                AuthenticationFailed(_('Invalid token.'))
        return (user, token)

    def authenticate(self, request):
        """Autehnticate credential."""
        token = request.GET.get('token', '')
        if token:
            keyword = 'Token'
            if self.test_jwt_token(token):
                keyword = 'Bearer'
            request.META['HTTP_AUTHORIZATION'] = f'{keyword} {token}'
        user_key = self.get_user_key_param(request)
        user, token = (
            super(CustomTokenAuthentication, self).authenticate(request)
        )
        self.test_user_key(user, user_key)
        return (user, token)


class BearerAuthentication(CustomTokenAuthentication):
    """Simple token based authentication using utvsapitoken.

    Clients should authenticate by passing the token key in the 'Authorization'
    HTTP header, prepended with the string 'Bearer ' or 'Token '.
    """

    keyword = ['token', 'bearer']

    def authenticate(self, request):
        """Authenticate."""
        auth = authentication.get_authorization_header(request).split()
        if not auth:
            return None
        if auth[0].lower().decode() not in self.keyword:
            return None

        if len(auth) == 1:
            msg = _('Invalid token header. No credentials provided.')
            raise authentication.exceptions.AuthenticationFailed(msg)
        elif len(auth) > 2:
            msg = _('Invalid token header. '
                    'Token string should not contain spaces.')
            raise authentication.exceptions.AuthenticationFailed(msg)
        # skip this authentication if this is a jwt token
        if self.test_jwt_token(auth[1].decode()):
            return None
        user, token = self.authenticate_credentials(auth[1])
        # validate if GeoSight-User-Key match with username
        user_key = request.META.get('HTTP_GEOSIGHT_USER_KEY', b'')
        self.test_user_key(user, user_key)
        return (user, token)

    def authenticate_header(self, request):
        """Header of authentication using token."""
        return self.keyword[0]
