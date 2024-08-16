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

from urllib import parse

from django.http import HttpResponseBadRequest
from django.shortcuts import get_object_or_404

from core.api.proxy import ProxyView
from core.settings.utils import ABS_PATH
from core.utils import set_query_parameter
from geosight.data.models.arcgis import ArcgisConfig


class ArcgisConfigProxy(ProxyView):
    """Proxying arcgis."""

    key = 'url'

    def get(self, request, pk):
        """Reurn token of arcgis."""
        config = get_object_or_404(ArcgisConfig, pk=pk)
        url = request.GET.get(self.key, None)
        if not url:
            return HttpResponseBadRequest(f'{self.key} is required')

        params = {}
        for key, value in request.GET.items():
            if key != self.key:
                params[key] = value


        file = ABS_PATH('arcgis_request')
        with open(file, 'a') as fd:
            fd.write(f'\n{set_query_parameter(parse.unquote(url), params)}')

        params['token'] = config.token_val
        url = set_query_parameter(parse.unquote(url), params)
        return self.fetch(url)
