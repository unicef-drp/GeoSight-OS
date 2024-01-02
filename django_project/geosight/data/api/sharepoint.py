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

from django.http import HttpResponseBadRequest
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView

from core.permissions import RoleContributorAuthenticationPermission
from geosight.data.models.sharepoint import SharepointConfig
from geosight.data.serializer.sharepoint import SharepointConfigSerializer


class SharepointConfigListAPI(APIView):
    """Return SharepointConfig list."""

    permission_classes = (RoleContributorAuthenticationPermission,)

    def get(self, request):
        """Return SharepointConfig list."""
        return Response(
            SharepointConfigSerializer(
                SharepointConfig.objects.all(), many=True
            ).data,
        )


class SharepointInformationAPI(APIView):
    """Test the sharepoint API."""

    permission_classes = (RoleContributorAuthenticationPermission,)

    def post(self, request, pk):
        """Test the sharepoint API."""
        sharepoint_config = get_object_or_404(SharepointConfig, pk=pk)
        try:
            _excel = sharepoint_config.load_excel(
                request.data['relative_url']
            )
            row_number_for_header = int(
                request.data.get('row_number_for_header', 1)
            ) - 1
            output = {}
            for key, sheet_data in _excel.items():
                output[key] = {
                    'headers': sheet_data[row_number_for_header]
                }
                try:
                    output[key]['example'] = sheet_data[
                        (row_number_for_header + 1)
                    ]
                except IndexError:
                    pass
            return Response(output)
        except KeyError as e:
            return HttpResponseBadRequest(
                f'{e} is required in payload'
            )
        except Exception as e:
            return HttpResponseBadRequest(f'{e}')
