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
import time

from django.core.cache import cache
from django.conf import settings
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from geosight.data.serializer.raster import GetRasterClassificationSerializer
from geosight.data.models.style.raster import COGClassification
from geosight.data.utils import (
    ClassifyRasterData,
    generate_cache_key,
    download_file_from_url
)


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
                minimum = serializer.validated_data.get('minimum', 0)
                maximum = serializer.validated_data.get('maximum', 100)

                try:
                    classification = COGClassification.objects.get(
                        url=url,
                        type=class_type,
                        number=class_num,
                        maximum=maximum,
                        minimum=minimum
                    ).result
                except COGClassification.DoesNotExist:
                    tmp_file_path = os.path.join(
                        settings.MEDIA_TEMP,
                        f"{os.path.basename(url)}"
                    )
                    tmp_file_path = download_file_from_url(url, tmp_file_path)

                    classification = ClassifyRasterData(
                        raster_path=tmp_file_path,
                        class_type=class_type,
                        class_num=class_num,
                        colors=colors,
                        maximum=maximum,
                        minimum=minimum
                    ).run()

                    COGClassification.objects.get_or_create(
                        url=url,
                        type=class_type,
                        number=class_num,
                        maximum=maximum,
                        minimum=minimum,
                        defaults={
                            'result': [float(a) for a in classification],
                        }
                    )

                # Cache the response for future requests
                cache.set(cache_key, classification, timeout=300)

            return Response(classification)
