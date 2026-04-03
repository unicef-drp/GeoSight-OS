# coding=utf-8
"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-No-reply@unicef.org

.. Note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""
__author__ = 'irwan@kartoza.com'
__date__ = '02/04/2026'
__copyright__ = ('Copyright 2023, Unicef')

from rest_framework.authentication import (
    SessionAuthentication
)
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from geosight.data_restorer.models import (
    Preferences, RequestRestoreData, fixtures_types
)
from geosight.data_restorer.tasks import run_request_restore_data


class FixtureTypesAPI(APIView):
    """API to return available fixture types."""

    permission_classes = [IsAdminUser]
    authentication_classes = [SessionAuthentication]

    def get(self, request, *args, **kwargs):  # noqa: DOC101,DOC103
        """
        Return list of available fixture types.

        :param request: The HTTP request object.
        :type request: HttpRequest
        :return: List of fixture types with name, description, and info.
        :rtype: Response
        """
        return Response([
            {
                'name': f.name,
                'description': f.description,
                'info': [
                    {'name': i.name, 'count': i.count} for i in f.info
                ],
            }
            for f in fixtures_types
        ])


class RequestRestoreDataAPI(APIView):
    """API to request data restoration."""

    permission_classes = [IsAdminUser]
    authentication_classes = [SessionAuthentication]

    def post(self, request, *args, **kwargs):  # noqa: DOC101,DOC103
        """
        Create a restore request and dispatch the task.

        :param request: The HTTP request object containing ``data_type``.
        :type request: HttpRequest
        :return: HTTP 201 on success, HTTP 400 if restoration is disabled.
        :rtype: Response
        """
        preferences = Preferences.load()
        if not preferences.is_enabled:
            return Response(
                status=400,
                data={'message': 'Data restoration is currently disabled.'}
            )

        data_type = request.data.get('data_type')
        restore_request = RequestRestoreData.objects.create(
            data_type=data_type
        )
        run_request_restore_data.delay(restore_request.id)
        return Response(status=201)


class RequestRestoreDataDetailAPI(APIView):
    """API to return the last restore request."""

    permission_classes = [IsAdminUser]
    authentication_classes = [SessionAuthentication]

    def get(self, request, *args, **kwargs):  # noqa: DOC101,DOC103
        """
        Return the last RequestRestoreData.

        :param request: The HTTP request object.
        :type request: HttpRequest
        :return: The most recent restore request with data_type, state,
            and note, or HTTP 404 if none exists.
        :rtype: Response
        """
        restore_request = RequestRestoreData.objects.order_by('-id').first()
        if not restore_request:
            return Response(status=404)
        return Response({
            'data_type': restore_request.data_type,
            'state': restore_request.state,
            'note': restore_request.note,
        })


class PreferencesAPI(APIView):
    """API to manage data restorer preferences."""

    permission_classes = [IsAdminUser]
    authentication_classes = [SessionAuthentication]

    def post(self, request, *args, **kwargs):  # noqa: DOC101,DOC103
        """
        Disable data restoration.

        :param request: The HTTP request object.
        :type request: HttpRequest
        :return: HTTP 200 on success.
        :rtype: Response
        """
        preferences = Preferences.load()
        preferences.enable_request = False
        preferences.save()
        return Response(status=200)
