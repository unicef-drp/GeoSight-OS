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
__date__ = '22/10/2024'
__copyright__ = ('Copyright 2023, Unicef')

import subprocess

from rest_framework.authentication import (
    SessionAuthentication, BasicAuthentication
)
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from core.auth import BearerAuthentication
from geosight.machine_info_fetcher.models import MachineInfo
from geosight.machine_info_fetcher.serializer import MachineInfoSerializer


class CheckDjangoMachineInfo(APIView):
    """Checking django machine information."""

    permission_classes = [IsAdminUser]
    authentication_classes = [
        SessionAuthentication, BasicAuthentication, BearerAuthentication
    ]

    def check_storage(self):
        """Check the storage."""
        cmd = ['du -shc /* | sort -h']
        bytes_arr = subprocess.check_output(
            cmd,
            shell=True,
            stderr=subprocess.DEVNULL
        )
        return bytes_arr.decode('utf-8')

    def check_memory(self):
        """Check the memory."""
        cmd = ['free', '-m']
        bytes_arr = subprocess.check_output(cmd)
        return bytes_arr.decode('utf-8')

    def get(self, request, *args, **kwargs):
        """Get machine information."""
        try:
            machine = MachineInfo.objects.create(
                source='django',
                storage_log=self.check_storage(),
                memory_log=self.check_memory()
            )
            return Response(
                MachineInfoSerializer(machine).data
            )
        except Exception as ex:
            return Response(
                status=400,
                data={
                    'message': str(ex)
                }
            )
