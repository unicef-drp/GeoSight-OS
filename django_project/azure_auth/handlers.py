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
from http import HTTPStatus

import msal
import requests
from django.conf import settings
from django.shortcuts import resolve_url
from django.urls import reverse

from .configuration import AzureAuthConfig
from .exceptions import (
    InvalidAuthenticationToken,
    RenameAttributesValueError,
    TokenError,
)
from .utils import logger_debug

logger = logging.getLogger(__name__)


class AzureAuthHandler:
    """Class to interface with `msal` package and execute auth process."""

    def __init__(self, request=None, config=None):
        """
        Initialize class with request object.

        :param request: HttpRequest
        """
        self.request = request
        self.build_uri = self.request.build_absolute_uri
        if config and config.CLIENT_ID == "''":
            config = None
        self._config = config if config else AzureAuthConfig
        self.redirect_uri = (
            self.build_uri(reverse(self._config.REDIRECT_URI))
            if not self._config.REDIRECT_URI.startswith("http")
            else self._config.REDIRECT_URI
        )
        # always starts with https://
        self.redirect_uri = self.redirect_uri.replace('http://', 'https://')
        self.logout_redirect_uri = (
            self.build_uri(self._config.LOGOUT_REDIRECT_URI)
            if not self._config.LOGOUT_REDIRECT_URI.startswith("http")
            else self._config.LOGOUT_REDIRECT_URI
        )
        # always starts with https://
        self.logout_redirect_uri = self.logout_redirect_uri.replace(
            'http://',
            'https://'
        )
        self.auth_flow_session_key = "auth_flow_{client_id}".format(
            client_id=self._config.CLIENT_ID
        )
        self.auth_flow_next_url_key = "auth_flow_next_url_{client_id}".format(
            client_id=self._config.CLIENT_ID
        )
        self.token_cache_session_key = "token_cache_{client_id}".format(
            client_id=self._config.CLIENT_ID
        )
        self.id_claims_session_key = "id_claims_{client_id}".format(
            client_id=self._config.CLIENT_ID
        )
        self._cache = msal.SerializableTokenCache()
        self._msal_app = None

    @staticmethod
    def find_stored_client_id_by_state(request):
        """Find the cliend id stored in session by state."""
        state = request.GET.get('state', None)
        if state is None:
            return None
        for client_id in settings.AZURE_REGISTERED_CLIENT_IDS:
            auth_flow_key = "auth_flow_{client_id}".format(
                client_id=client_id
            )
            if auth_flow_key in request.session:
                return client_id
        return None

    def get_auth_uri(self) -> str:
        """
        Request the auth flow dictionary and store it on the session.

        The flow is queried later in the auth process.
        Next query param will be stored in session auth_flow_next_url_key

        :return: Authentication redirect URI
        """
        output = ""
        try:
            next = self.request.GET.get('next', None)
            if next:
                self.request.session[self.auth_flow_next_url_key] = next
            flow = self.msal_app.initiate_auth_code_flow(
                scopes=self._config.SCOPES,
                redirect_uri=self.redirect_uri,
            )
            auth_uri = flow.get("auth_uri")
            if auth_uri:
                self.request.session[self.auth_flow_session_key] = flow
                output = auth_uri
        except Exception as e:
            logger.exception(e)
        logger.debug("get_auth_uri: %s", output)
        return output

    def get_auth_flow_next_uri(self) -> str:
        """Get auth_flow_next_url_key from session."""
        next_uri = self.request.session.pop(self.auth_flow_next_url_key, None)
        return next_uri

    def get_token_from_flow(self) -> dict:
        """
        Acquire the token from the auth flow on the session.

        Also retrieve the content of
        the redirect request from Active Directory.

        :return: Token result containing `access_token`/`id_token` and other
        claims, depending on scopes used
        """
        output = {}
        try:
            flow = self.request.session.pop(self.auth_flow_session_key, {})
            token_result = self.msal_app.acquire_token_by_auth_code_flow(
                auth_code_flow=flow, auth_response=self.request.GET
            )
            token_error = token_result.get("error")
            if token_error:
                raise TokenError(token_result)

            self._save_cache()
            self.request.session[self.id_claims_session_key] = (
                token_result["id_token_claims"]
            )
            output = token_result
        except Exception as e:
            logger.exception(e)
        logger_debug("get_token_from_flow", output, logger)
        return output

    def get_token_from_cache(self):
        """Retrieve the token from cache, otherwise fetch new token."""
        if not self.msal_app:
            return None
        accounts = self.msal_app.get_accounts()
        if accounts:  # pragma: no branch
            # Will return `None` if CCA cannot retrieve or generate new token
            token_result = self.msal_app.acquire_token_silent(
                scopes=self._config.SCOPES, account=accounts[0]
            )
            self._save_cache()
            return token_result

    def get_logout_uri(self, post_redirect=None) -> str:
        """
        Form the URI to log the user out in the Active Directory app.

        After logout, redirect to the webapp logout page.

        :return: Active Directory app logout URI
        """
        output = self._config.LOGOUT_URI
        try:
            resolved_url = resolve_url(
                post_redirect or self.logout_redirect_uri
            )
            if resolved_url:
                output += (
                        "?post_logout_redirect_uri=" + resolved_url
                )
        except Exception as e:
            logger.exception(e)
        logger.debug("get_logout_uri: %s", output)
        return output

    @property
    def msal_app(self, *args, **kwargs) -> None:
        """Get or initialize the msal instance."""
        output = None
        try:
            if not self._msal_app:
                # validate_authority="https://login.microsoftonline.com/"
                # in AzureAuthConfig.AUTHORITY,
                self._msal_app = msal.ConfidentialClientApplication(
                    client_id=self._config.CLIENT_ID,
                    client_credential=self._config.CLIENT_SECRET,
                    authority=self._config.AUTHORITY,
                    token_cache=self.cache,
                    validate_authority=self._config.AUTHORITY.startswith(
                        "https://login.microsoftonline.com/"
                    ),
                )
            output = self._msal_app
        except Exception as e:
            logger.exception(e)
        logger.debug("msal_app: %s", output)
        return output

    @property
    def cache(self):
        """Get and deserialize token_cache from session."""
        token_cache = self.request.session.get(self.token_cache_session_key)
        if token_cache:
            self._cache.deserialize(token_cache)
        return self._cache

    def _save_cache(self):
        if self._cache and self._cache.has_state_changed:
            self.request.session[self.token_cache_session_key] = (
                self._cache.serialize()
            )

    def _get_microsoft_graph_user(self, token: dict, *args, **kwargs) -> dict:
        output = {}
        try:
            access_token = token.get("access_token")
            if not access_token:
                return output

            response = requests.get(
                self._config.MS_GRAPH_API,
                headers={"Authorization": f"Bearer {access_token}"},
            )
            if response.ok:
                output = response.json()
            elif response.status_code == HTTPStatus.UNAUTHORIZED:
                raise InvalidAuthenticationToken(response.json()["error"])

        except Exception as e:
            logger.exception(e)
        logger_debug("_get_microsoft_graph_user", output, logger)
        return output

    @staticmethod
    def get_user_email(user: dict):
        """Retrieve email from user dictionary."""
        email = 'NoEMAIL'
        if 'email' in user:
            email = user.get('email').lower()
        elif 'emails' in user:
            emails = user.get('emails')
            if len(emails) > 0:
                email = emails[0].lower()
        return email

    def _rename_attributes(self, dct: dict, *args, **kwargs) -> dict:
        """Transform user dictionary using RENAME_ATTRIBUTES."""
        output = dct
        try:
            for bad, good in self._config.RENAME_ATTRIBUTES:
                value = dct.get(bad)
                if not value:
                    continue

                good_ = dct.get(good)
                if good_ and good_ != value:
                    raise RenameAttributesValueError(
                        f"`{good}` key already exists with value `{good_}`, "
                        f"new value `{value}` is different."
                    )

                "email enforce lower case"
                if good == "email":
                    value = value.lower()
                dct[good] = value

            output = dct
            output['email'] = self.get_user_email(dct)
        except Exception as e:
            logger.exception(e)
        logger_debug("_rename_attributes", output, logger)
        return output

    def _combine_user_details(self, token: dict, *args, **kwargs) -> dict:
        """Combine user info dictionaries."""
        output = {}
        try:
            infos = {}
            infos.update(token.get("id_token_claims"))
            infos = self._rename_attributes(infos)
            if infos:
                output = infos
        except Exception as e:
            logger.exception(e)
        logger_debug("_combine_user_details", output, logger)
        return output

    def user_django_mapping(self, token: dict, *args, **kwargs) -> dict:
        """Map user dictionary from token to Django User."""
        output = {}
        try:
            user = self._combine_user_details(token)
            if user:
                output = {
                    key: value
                    for key, value in user.items()
                    if value and key in [
                        good for bad, good in self._config.RENAME_ATTRIBUTES
                    ]
                }

                if not output.get("username"):
                    output["username"] = user.get("email", "")

                if self._config.SAVE_ID_TOKEN_CLAIMS:
                    user.pop("@odata.context", "")
                    output["id_token_claims"] = user
        except Exception as e:
            logger.exception(e)
        logger_debug("user_django_mapping", output, logger)
        return output

    def flush_session_cache(self):
        """Remove session variables."""
        self.request.session.pop(self.token_cache_session_key, '')
        self.request.session.pop(self.id_claims_session_key, '')
