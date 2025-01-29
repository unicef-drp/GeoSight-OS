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

import io

from django.contrib.gis.db import models
from office365.runtime.auth.authentication_context import AuthenticationContext
from office365.sharepoint.client_context import ClientContext
from office365.sharepoint.files.file import File
from pyexcel_xls import get_data as xls_get
from pyexcel_xlsx import get_data as xlsx_get

from core.models import AbstractTerm


class SharepointError(Exception):
    """Exception raised for errors in sharepoint request."""

    def __init__(self, message="Sharepoint request error."):
        """Init function."""
        self.message = message
        super().__init__(self.message)


class SharepointConfig(AbstractTerm):
    """Sharepoint config model."""

    url = models.TextField()
    client_id = models.TextField()
    client_secret = models.TextField()

    def full_name(self):
        """Return full name."""
        return f'{self.name} ({self.url})'

    def setup_context(self):
        """Authenticate the context from the config."""
        context_auth = AuthenticationContext(self.url)
        if context_auth.acquire_token_for_app(
                client_id=self.client_id, client_secret=self.client_secret
        ):
            self.ctx = ClientContext(self.url, context_auth)
        else:
            raise SharepointError('Client ID and Secret is not correct.')

    def load_file(self, relative_url):
        """Load file content from relative url."""
        self.setup_context()
        response = File.open_binary(self.ctx, relative_url)
        if response.status_code == 200:
            try:
                return io.BytesIO(response.content)
            except Exception as e:
                raise SharepointError(f'Error {response.status_code} : {e}')
        elif response.status_code in [400, 404]:
            raise SharepointError('File does not exist.')
        else:
            raise SharepointError(
                f'Error {response.status_code} : {response.text}'
            )

    def load_excel(self, relative_url):
        """Load excel content from relative url."""
        content = self.load_file(relative_url=relative_url)
        try:
            try:
                return xlsx_get(content)
            except Exception:
                return xls_get(content)
        except Exception:
            raise Exception('File is not excel.')
