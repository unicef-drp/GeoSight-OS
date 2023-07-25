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

import mimetypes
import os

from django.conf import settings
from django.http import (
    HttpResponse, HttpResponseBadRequest, HttpResponseNotFound
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from core.permissions import AdminAuthenticationPermission


class DownloadFile(APIView):
    """Download file."""

    permission_classes = (IsAuthenticated, AdminAuthenticationPermission,)
    folder = None

    def get(self, request, **kwargs):
        """Download file."""
        filepath = request.GET.get('file', None)
        if not filepath:
            return HttpResponseBadRequest('file is required in parameter')
        path = os.path.join(self.folder, filepath.lstrip("/"))

        try:
            if not os.path.exists(path):
                return HttpResponseNotFound(f'{filepath} does not exist')

            fl = open(path, 'rb')
            mime_type, _ = mimetypes.guess_type(path)
            response = HttpResponse(fl, content_type=mime_type)
            response['Content-Disposition'] = (
                    "attachment; filename=%s" % os.path.basename(path)
            )
            return response
        except UnicodeEncodeError:
            return HttpResponseBadRequest('file need to be encoded')


class DownloadSharepointFile(DownloadFile):
    """Download sharepoint file."""

    folder = settings.ONEDRIVE_ROOT


class DownloadBackupsFile(DownloadFile):
    """Download backups file."""

    folder = settings.BACKUPS_ROOT
