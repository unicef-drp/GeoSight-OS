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
from core.utils import set_query_parameter, parse_url
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

        # Check if config host same with host
        config_host, _ = parse_url(
            parse.unquote(config.generate_token_url)
        )
        input_url = parse.unquote(url)

        # Create url of arcgis
        params = {}
        for key, value in request.GET.items():
            if key != self.key:
                params[key] = value
        params['token'] = config.token_val

        url = set_query_parameter(
            input_url, params
        )
        url_host, params = parse_url(parse.unquote(url))
        if config_host != url_host:
            return HttpResponseBadRequest(
                'Url host does not match with config'
            )

        # Just allow FeatureServer or MapServer
        if all(c not in input_url for c in ['/FeatureServer/', '/MapServer/']):
            return HttpResponseBadRequest(
                'Just allow FeatureServer or MapServer'
            )
        return self.fetch(url)
