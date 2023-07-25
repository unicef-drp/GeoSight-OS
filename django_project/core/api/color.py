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

from rest_framework.response import Response
from rest_framework.views import APIView

from core.models.color import ColorPalette
from core.serializer.color import ColorPaletteSerializer


class ColorPaletteListAPI(APIView):
    """Return ColorPalette list."""

    def get(self, request):
        """Return ColorPalette list."""
        return Response(
            ColorPaletteSerializer(
                ColorPalette.objects.all(), many=True
            ).data
        )
