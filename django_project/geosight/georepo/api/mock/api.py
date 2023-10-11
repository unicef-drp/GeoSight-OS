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
import os

from django.http import Http404
from rest_framework.response import Response
from rest_framework.views import APIView

from core.settings.utils import ABS_PATH
from geosight.georepo.api.mock.create_responses_template import (
    GeorepoGenerator
)


class MockGeorepoAPI(APIView):
    """Mock API from georepo."""

    def get(self, request):
        """Get the response."""
        georepo_path = request.path.replace('/georepo/mock', '')
        _folder = ABS_PATH('geosight', 'georepo', 'api', 'mock', 'responses')
        generator = GeorepoGenerator()
        generator.FOLDER = _folder
        _file = generator._file(georepo_path)
        if request.GET.get('page', '1') != '1':
            return Response(
                {
                    "page": 2,
                    "page_size": 100000,
                    "total_page": 1,
                    "results": []
                }
            )

        if not os.path.exists(_file):
            raise Http404()
        try:
            f = open(_file)
            return Response(json.load(f))
        except Exception:
            raise Http404()
