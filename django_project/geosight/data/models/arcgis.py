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
__date__ = '20/11/2023'
__copyright__ = ('Copyright 2023, Unicef')

import json
from datetime import datetime

import pytz
import requests
from celery.utils.log import get_task_logger
from django.conf import settings
from django.contrib.gis.db import models
from django.core import signing
from django.core.signing import BadSignature
from django.utils import timezone

from core.models import AbstractTerm
from core.models.preferences import SitePreferences

logger = get_task_logger(__name__)

url = (
    'https://developers.arcgis.com/rest/services-reference/'
    'enterprise/generate-token.htm'
)


class ArcgisConfig(AbstractTerm):
    """Sharepoint config model."""
    generate_token_url = models.CharField(
        max_length=512,
        help_text=(
            'You can check your generate token url in '
            f'<a href="{url}">{url}</a>.<br>'
            'If your arcgis is federated one, please use url : '
            'https://{host}:{port}/portal/sharing/generateToken.'
        )
    )
    username = models.CharField(max_length=256)
    password = models.CharField(max_length=256)

    # Token of the config
    token = models.TextField(
        null=True, blank=True,
        help_text='This token will be generated automatically.'
    )
    expires = models.DateTimeField(
        null=True, blank=True, help_text='The expires date of token.'
    )
    message = models.TextField(
        null=True, blank=True, help_text='Messasge when generate token error.'
    )

    def full_name(self):
        """Return full name."""
        return f'{self.name} ({self.generate_token_url})'

    @property
    def password_val(self):
        """Return password."""
        try:
            return signing.loads(self.password)
        except (TypeError, BadSignature):
            return ''

    @property
    def token_val(self):
        """Return token."""
        try:
            if self.expires and self.expires <= timezone.now():
                return self.generate_token()
            return signing.loads(self.token)
        except (TypeError, BadSignature):
            return self.generate_token()

    @staticmethod
    def request_generate_token(
            generate_token_url: str, username: str, password: str
    ) -> (str, datetime):
        """Generate token."""
        pref = SitePreferences.preferences()
        headers = {'Content-Type': 'application/x-www-form-urlencoded'}
        data = {
            "username": f"{username}",
            "password": password,
            "referer": f"{pref.site_url}",
            "f": "json",
            "expiration": "43800",
        }
        response = requests.post(
            generate_token_url, data=data, headers=headers
        )
        response = response.json()
        if 'error' in response:
            raise Exception(json.dumps(response['error']))
        expires = datetime.fromtimestamp(
            response['expires'] / 1000,
            tz=pytz.timezone(settings.TIME_ZONE)
        )
        return response['token'], expires

    def generate_token(self):
        """Generate token and autosave."""
        try:
            token, expires = ArcgisConfig.request_generate_token(
                self.generate_token_url, self.username, self.password_val
            )
            self.message = ''
            self.token = signing.dumps(token)
            self.expires = expires
            self.save()
            return token
        except Exception as e:
            logger.error(f'{self.full_name} - {e}')
            self.token = None
            self.expires = None
            self.message = f'{e}'
            self.save()
            return None
