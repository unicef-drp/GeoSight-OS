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

import json

from django.http import HttpResponseForbidden
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from geosight.data.models.style import Style
from geosight.data.serializer.style import StyleSerializer
from geosight.permission.access import delete_permission_resource


class StyleListAPI(APIView):
    """Return StyleLayer list."""

    def get(self, request):
        """Return StyleLayer list."""
        return Response(
            StyleSerializer(
                Style.permissions.list(request.user).order_by('name'),
                many=True, context={'user': request.user}
            ).data
        )

    def delete(self, request):
        """Delete an basemap."""
        user = request.user
        if not (user.is_authenticated and user.profile.is_contributor):
            return HttpResponseForbidden()

        ids = json.loads(request.data['ids'])
        for obj in Style.permissions.delete(request.user).filter(
                id__in=ids):
            obj.delete()
        return Response('Deleted')


class StyleDetailAPI(APIView):
    """API for detail of style."""

    permission_classes = (IsAuthenticated,)

    def delete(self, request, pk):
        """Delete an style."""
        style = get_object_or_404(Style, pk=pk)
        delete_permission_resource(style, request.user)
        style.delete()
        return Response('Deleted')


import requests
from django.conf import settings
from geosight.data.utils import ClassifyRasterData
import uuid
from rest_framework import serializers
import os


class GetRasterClassSerializer(serializers.Serializer):
    url = serializers.URLField()
    class_type = serializers.CharField()
    class_num = serializers.IntegerField()
    colors = serializers.ListField()


class GetRasterClassificationAPI(APIView):
    """API for getting style."""

    permission_classes = (IsAuthenticated,)
    serializer_class = GetRasterClassSerializer

    def post(self, request):
        """Get raster classification."""

        # url = request.data.get('url')
        # class_type = request.data.get('class_type')
        # class_num = request.data.get('class_num')
        serializer = self.get_serializer(data=request.data, many=many)

        # if not url:
        #     return Response('URL parameter is required', status=400)
        # try:
        #     class_num = int(class_num)
        # except ValueError:
        #     return Response('class_number parameter must be integer', status=400)
        breakpoint()

        tmp_file_path = os.path.join(
            settings.MEDIA_TEMP,
            os.path.basename(url)
        )
        response = requests.get(url, stream=True)
        if not os.path.exists(tmp_file_path):
            if response.status_code == 200:
                with open(tmp_file_path, "wb") as tmp_file:
                    for chunk in response.iter_content(chunk_size=8192):
                        tmp_file.write(chunk)
            else:
                raise Exception(
                    f"Failed to download file: {response.status_code}"
                )

        classification = ClassifyRasterData(tmp_file_path, class_type, class_number).run()

        return Response(classification)