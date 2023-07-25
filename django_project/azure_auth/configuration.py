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
from functools import cached_property, lru_cache
from types import SimpleNamespace

from django.conf import settings

logger = logging.getLogger(__name__)


class _AzureAuthConfig:
    PATTERN_AUTHORITY_URI = (
        'https://{tenant_name}.b2clogin.com/'
        '{tenant_name}.onmicrosoft.com/{policy_name}'
    )
    PATTERN_JWKS_URI = (
            PATTERN_AUTHORITY_URI + '/discovery/v2.0/keys'
    )

    def __init__(self, config={}, namespace='azure_auth:callback',
                 *args, **kwargs):
        self._config = config
        self._azure_enabled = len(config) > 0
        self._namespace = namespace

    @cached_property
    def config(self, *args, **kwargs) -> dict:
        """Initiate config dictionary."""
        output = {}
        try:
            output = self._config.copy()
            output['MS_GRAPH_API'] = 'https://graph.microsoft.com/v1.0/me'
            output['RENAME_ATTRIBUTES'] = output.pop('RENAME_ATTRIBUTES', [])
            output['RENAME_ATTRIBUTES'] = list(
                set(output['RENAME_ATTRIBUTES'])
            )
            # output['TENANT_ID'] = output.pop('TENANT_ID', 'common')
            output['TENANT_NAME'] = output.pop('TENANT_NAME', 'common')
            output['POLICY_NAME'] = output.pop('POLICY_NAME', 'b2c_1_susi')
            output['AUTHORITY'] = output.pop(
                'AUTHORITY',
                ''
            )
            if output['AUTHORITY'] == '':
                output['AUTHORITY'] = self.PATTERN_AUTHORITY_URI.format(
                    tenant_name=output['TENANT_NAME'],
                    policy_name=output['POLICY_NAME']
                )
            output['JWKS_URI'] = output.pop(
                'JWKS_URI',
                ''
            )
            if output['JWKS_URI'] == '':
                output['JWKS_URI'] = self.PATTERN_JWKS_URI.format(
                    tenant_name=output['TENANT_NAME'],
                    policy_name=output['POLICY_NAME']
                )
            output['LOGOUT_URI'] = output['AUTHORITY'] + '/oauth2/v2.0/logout'
            output['PUBLIC_URLS'] = [
                                        'azure_auth:login',
                                        'azure_auth:logout',
                                        'azure_auth:callback',
                                        'login',  # django login page
                                    ] + output.pop('PUBLIC_URLS', [])
            output['PUBLIC_URLS'] = list(set(output['PUBLIC_URLS']))
            output['REDIRECT_URI'] = output.pop('REDIRECT_URI',
                                                self._namespace)
            output['LOGOUT_REDIRECT_URI'] = output.pop(
                'LOGOUT_REDIRECT_URI', settings.LOGOUT_REDIRECT_URL
            )
            output['MESSAGE_SUCCESS'] = output.pop(
                'MESSAGE_SUCCESS',
                'Welcome <b>{first_name}</b> &#128075; you now are logged in.',
            )
            output['MESSAGE_ERROR'] = output.pop(
                'MESSAGE_ERROR', 'An error occured, we cannot sign you in.'
            )
            output['SAVE_ID_TOKEN_CLAIMS'] = output.pop('SAVE_ID_TOKEN_CLAIMS',
                                                        False)
            output['SCOPES'] = output.pop('SCOPES', ['User.Read'])
        except Exception as e:
            logger.exception(e)
        return output

    @lru_cache
    def parse_settings(self, *args, **kwargs):
        """Parse settings from dictionary."""
        output = None
        if not self._azure_enabled:
            return output
        try:
            self.sanity_check_configs()
            config = SimpleNamespace(**self.config)

            output = config
        except Exception as e:
            logger.exception(e)
        return output

    @lru_cache
    def sanity_check_configs(self) -> None:
        required = ('CLIENT_ID', 'CLIENT_SECRET',
                    'TENANT_NAME', 'POLICY_NAME')
        for req in required:
            assert self.config.get(req), f'{req} must be non-empty string'

        is_string = required + (
            'LOGOUT_REDIRECT_URI',
            'LOGOUT_URI',
            'MESSAGE_ERROR',
            'MESSAGE_SUCCESS',
            'REDIRECT_URI',
        )
        for req in is_string:
            req_ = self.config.get(req)
            if not req_:
                continue
            assert str(req_), f'{req} must be non-empty string'

        is_list = ('PUBLIC_URI', 'SCOPES')
        for req in is_list:
            req_ = self.config.get(req)
            if not req_:
                continue
            assert list(req_), f'{req} must be non-empty list'

        is_bool = ('SAVE_ID_TOKEN_CLAIMS',)
        for req in is_bool:
            req_ = self.config.get(req)
            if not req_:
                continue
            assert isinstance(req_, bool), f'{req} must be bool'


def get_config_instance(config={}):
    """Get config instance from dictionary."""
    return _AzureAuthConfig(config=config).parse_settings()


AzureAuthConfig = _AzureAuthConfig(config=settings.AZURE_AUTH).parse_settings()
