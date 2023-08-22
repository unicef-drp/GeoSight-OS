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

from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView

from docs.models.page import Page
from docs.serializer.page import PageSerializer


class DocumentationDetail(APIView):
    """Documentation detail."""

    def get(self, request, page_name, *args, **kwargs):
        """Get access request detail."""
        page = get_object_or_404(Page, name=page_name)
        return Response(PageSerializer(page).data)
