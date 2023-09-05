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

import logging
import re
from typing import Optional

import jwt
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend
from django.contrib.auth.mixins import LoginRequiredMixin
from django.core.cache import cache
from django.http import HttpRequest
from django.utils.translation import gettext_lazy as _
from jwt import DecodeError, InvalidTokenError, PyJWKClient, PyJWKClientError
from rest_framework import authentication, exceptions

from .configuration import AzureAuthConfig
from .exceptions import InvalidUserError
from .handlers import AzureAuthHandler
from .models import RegisteredDomain

UserModel = get_user_model()

logger = logging.getLogger(__name__)


class AzureAuthBackend(ModelBackend):
    """Authenticates against settings.AUTH_USER_MODEL."""

    def is_valid_user(self, user: dict, *args, **kwargs) -> bool:
        """Test whether user has all required attributes."""
        output = False
        required_attributes = ['email']
        try:
            all_required = all(user.get(a) for a in required_attributes)
            assert all_required, "At least one required attribute is missing."
            output = all_required

            all_string = all(isinstance(user.get(a), str) for a in
                             required_attributes)
            assert all_string, "At least one required attribute "
            "is not a string."
            output = all_string

        except Exception as e:
            logger.exception(e)
        logger.debug("is_valid_user: %s", output)
        return output

    @staticmethod
    def extract_domain(email: str) -> Optional[RegisteredDomain]:
        """Extract domain from email."""
        email_parts = email.split('@')
        if len(email_parts) < 2:
            return None

        # assume exact match, no subdomain matching
        domain = email_parts[-1].lower()
        try:
            return RegisteredDomain.objects.get(domain=domain)
        except RegisteredDomain.DoesNotExist:
            return None

    @staticmethod
    def check_if_allowed_users(user, request=None):
        """Check whether user email has unicef domain."""
        if 'email' not in user:
            raise InvalidUserError()
        domain = AzureAuthBackend.extract_domain(user['email'])
        if user['email'] == 'NoEMAIL' or not domain:
            # invalid email or non unicef user
            if request:
                # flush session
                request.session.flush()
            # raise InvalidUserError so can be caught in callback view
            raise InvalidUserError()

    @staticmethod
    def clean_user_email(user_email):
        """Clean email that starts with 'live.com#'."""
        clean_email = user_email
        if clean_email:
            clean_email = re.sub(r'^live\.com#', '', clean_email)
        return clean_email

    @staticmethod
    def get_user_from_user_model(user: dict):
        """
        Dual search on both username & email.

        Canonical approach:

        `UserModel._default_manager.get_by_natural_key(
            user.get("username", "NoUsername")`
        """
        clean_email = AzureAuthBackend.clean_user_email(user['email'])
        return UserModel._default_manager.get(email=clean_email)

    @staticmethod
    def update_user_attributes(user: object, attributes=dict, *args, **kwargs):
        """Update user object with attributes."""
        try:
            for key, value in attributes.items():
                if not value:
                    continue
                setattr(user, key, value)
            user.save()
        except Exception as e:
            logger.exception(e)

    @staticmethod
    def assign_user_to_group(user: UserModel):
        """Update user object with attributes."""
        domain = AzureAuthBackend.extract_domain(user.email)
        if domain and domain.group:
            domain.group.user_set.add(user)

    @staticmethod
    def create_new_user(user_dict, request=None):
        """Check if valid user and create new user if valid."""
        AzureAuthBackend.check_if_allowed_users(user_dict, request)
        if 'email' in user_dict:
            user_dict['email'] = AzureAuthBackend.clean_user_email(
                user_dict['email'])
            user_dict['username'] = user_dict['email']
        user = UserModel._default_manager.create_user(**user_dict)
        user.save()
        return user

    def authenticate(self, request, token={}, *args, **kwargs):
        """
        Authenticate the user using token.

        Gets the Azure user from the id token and
        gets/creates the associated Django user.

        :param token: MSAL auth token dictionary
        :return: Django user instance
        """
        output = None
        user_ = None
        try:
            if not token:
                return output

            user_ = AzureAuthHandler(request).user_django_mapping(token)
            if not user_:
                return output

            if not self.is_valid_user(user_):
                return output
            try:
                user = self.get_user_from_user_model(user_)
                self.update_user_attributes(user, user_)
            except UserModel.DoesNotExist:
                # create new user will check if
                # domain belongs to registered group(s)
                user = self.create_new_user(user_, request)

            AzureAuthBackend.assign_user_to_group(user)

            if not self.user_can_authenticate(user):
                logger.debug('user_can_authenticate false')
                return output

            output = user
        except InvalidUserError as e:
            request.session['b2c_user'] = user_
            raise e
        except Exception as e:
            logger.exception(e)
        logger.debug("authenticate: %s", output)

        if output is not None:
            try:
                del request.session['b2c_user']
            except KeyError:
                pass
        return output

    def get_user(self, user_id):
        """Retrieve user by user_id."""
        try:
            user = UserModel._default_manager.get(pk=user_id)
        except UserModel.DoesNotExist:
            return None
        return user if self.user_can_authenticate(user) else None


class CachingJWKClient(PyJWKClient):
    """Cache JWKS."""

    cache_key = "AZURE_AUTH_JWKS"
    cache_timeout_1_day = 60 * 60 * 24

    def __init__(self, uri: str):
        """Initiate PyJWKClient."""
        super().__init__(uri)

    def fetch_data(self):
        """Get or Set JWKS from cache."""
        return cache.get_or_set(
            self.cache_key,
            super().fetch_data,
            timeout=self.cache_timeout_1_day
        )


class JWTAccessTokenAuthentication(authentication.BaseAuthentication):
    """JWT Token Authentication for REST API."""

    regex_bearer = re.compile(r"^[Bb]earer (.*)$")

    def __init__(self, *args, **kwargs):
        """Initialize Authentication class."""
        internal_extra_jwt_decode_options = kwargs.get(
            "internal_extra_jwt_decode_options"
        )
        if internal_extra_jwt_decode_options:
            self.internal_extra_jwt_decode_options = (
                internal_extra_jwt_decode_options
            )
        # Retrieving JWKS
        jwks_client = kwargs.get("internal_jwks_client")
        if jwks_client:
            self.jwks_client = jwks_client
        else:
            self.jwks_client = CachingJWKClient(
                AzureAuthConfig.JWKS_URI
            )

    def check_and_create_new_user(self, user_email):
        """
        Check whether user_email is in registered domain.

        If yes, then create new user and add to the Group.
        Raise InvalidUserError if outside registered domain.
        """
        user = AzureAuthBackend.create_new_user({
            'username': user_email,
            'email': user_email
        })
        AzureAuthBackend.assign_user_to_group(user)
        return user

    def authenticate(self, request: HttpRequest):
        """Authenticate using JWT Token stored in Authorization header."""
        # Extract header
        header_authorization_value = request.headers.get("authorization")
        if not header_authorization_value:
            return None
        # Extract supposed raw JWT
        match = self.regex_bearer.match(header_authorization_value)
        if not match:
            return None
        raw_jwt = match.groups()[-1]
        # Extract "kid"
        try:
            key_id = self.jwks_client.get_signing_key_from_jwt(raw_jwt)
        except PyJWKClientError as e:
            error_message = str(e)
            if "Unable to find a signing key" in error_message:
                raise exceptions.AuthenticationFailed(
                    "JWT does not have a valid Key ID"
                )
            else:
                # TODO: need to find proper exception
                raise NotImplementedError
        except DecodeError:
            raise exceptions.AuthenticationFailed(
                "Bearer does not contain a valid JWT"
            )

        options = None
        extra_params = {
            "algorithms": ["RS256"],
            "audience": AzureAuthConfig.CLIENT_ID
        }
        # See the constructor method to understand this
        if hasattr(self, "internal_extra_jwt_decode_options"):
            options = getattr(self, "internal_extra_jwt_decode_options")
        try:
            data = jwt.decode(raw_jwt, key_id.key,
                              **extra_params, options=options)
        except InvalidTokenError:
            raise exceptions.AuthenticationFailed("Bearer token is invalid")

        return self.authenticate_credentials(data)

    def authenticate_credentials(self, data):
        """Authenticate user by email as username."""
        user_email = AzureAuthHandler.get_user_email(data)
        try:
            user = AzureAuthBackend.get_user_from_user_model({
                'email': user_email
            })
        except UserModel.DoesNotExist:
            try:
                user = self.check_and_create_new_user(user_email)
            except InvalidUserError:
                raise exceptions.AuthenticationFailed(_('Invalid token.'))
        if not user.is_active:
            raise exceptions.AuthenticationFailed(
                _('User inactive or deleted.')
            )
        return user, data


class AzureAuthRequiredMixin(LoginRequiredMixin):
    """Verify the user has valid access token in the session."""

    def dispatch(self, request, *args, **kwargs):
        """Check if there is valid token in session."""
        if settings.USE_AZURE:
            if not AzureAuthHandler(request).get_token_from_cache():
                return self.handle_no_permission()
        return super().dispatch(request, *args, **kwargs)


def check_azure_authentication(request):
    """Check whether user has valid access token in session."""
    if not settings.USE_AZURE:
        return request.user.is_authenticated
    if AzureAuthHandler(request).get_token_from_cache():
        if request.user.is_authenticated:
            return True
    return False
