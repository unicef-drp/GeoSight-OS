# coding=utf-8
"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""
__author__ = 'zakki@kartoza.com'
__date__ = '22/01/2025'
__copyright__ = ('Copyright 2025, Unicef')

import os

import requests
from django.conf import settings
from django.core.cache import cache
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from geosight.data.utils import (
    ClassifyRasterData,
    generate_cache_key
)
from geosight.data.serializer.raster import GetRasterClassificationSerializer


class GetRasterClassificationAPI(APIView):
    """API for getting style."""

    permission_classes = (IsAuthenticated,)
    serializer_class = GetRasterClassificationSerializer

    def post(self, request):
        """Get raster classification."""
        serializer = self.serializer_class(data=request.data)

        if serializer.is_valid(raise_exception=True):
            # Generate cache key
            cache_key = generate_cache_key(
                request.path,
                serializer.validated_data
            )

            # Check if cached response exists
            cached_response = cache.get(cache_key)
            if cached_response:
                classification = cached_response
            else:
                url = serializer.validated_data['url']
                class_type = serializer.validated_data['class_type']
                class_num = serializer.validated_data['class_num']
                colors = serializer.validated_data.get('colors', None)

                tmp_file_path = os.path.join(
                    settings.MEDIA_TEMP,
                    os.path.basename(url)
                )
                response = requests.get(url, stream=True)
                if not os.path.exists(tmp_file_path):
                    if response.status_code == 200:
                        with open(tmp_file_path, "wb") as tmp_file:
                            for chunk in response.iter_content(
                                    chunk_size=8192
                            ):
                                tmp_file.write(chunk)
                    else:
                        raise Exception(
                            f"Failed to download file: {response.status_code}"
                        )

                classification = ClassifyRasterData(
                    raster_path=tmp_file_path,
                    class_type=class_type,
                    class_num=class_num,
                    colors=colors
                ).run()
                # Cache the response for future requests
                cache.set(cache_key, classification, timeout=300)

            return Response(classification)
