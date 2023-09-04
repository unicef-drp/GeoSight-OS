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
__date__ = '22/08/2023'
__copyright__ = ('Copyright 2023, Unicef')

from django.db.models import Q
from django.http import Http404
from rest_framework.response import Response
from rest_framework.views import APIView

from docs.models.page import Page
from docs.serializer.page import PageSerializer


class DocumentationDetail(APIView):
    """Documentation detail."""

    def get(self, request, *args, **kwargs):
        """Get documentation detail."""
        relative_url = request.GET.get('relative_url', '')
        root = Page.objects.filter(
            Q(relative_url='') | Q(relative_url__isnull=True)
        ).first()
        page = root
        if relative_url:
            urls = []
            if relative_url[0] == '/':
                relative_url = relative_url[1:]
            relative_urls = relative_url.split('/')
            for idx, url in enumerate(relative_urls):
                if len(relative_urls[:idx]):
                    urls.append(relative_urls[:idx])
            urls_query = ['/'.join(url) for url in urls]
            urls_query += ['/'.join(url + ['']) for url in urls]
            urls_query += ['/'.join([''] + url) for url in urls]
            urls_query += ['/'.join([''] + url + ['']) for url in urls]
            page = Page.objects.filter(relative_url__in=urls_query).order_by(
                '-relative_url').first()
            if not page:
                page = root
        if not page:
            raise Http404
        return Response(PageSerializer(page).data)
