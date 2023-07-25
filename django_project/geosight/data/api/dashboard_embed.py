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

from django.db import transaction
from django.http import HttpResponseBadRequest
from django.shortcuts import get_object_or_404
from rest_framework.response import Response

from geosight.data.api.dashboard_bookmark import DashboardBookmarkAPI
from geosight.data.forms.dashboard_embed import DashboardEmbedForm
from geosight.data.models.dashboard import (
    Dashboard
)
from geosight.data.serializer.dashboard_embed import DashboardEmbedSerializer


class DashboardEmbedAPI(DashboardBookmarkAPI):
    """Return Dashboard embed detail."""

    def save(self, request, dashboard):
        """Save bookmark."""
        data = self.update_bookmark_data(request, dashboard)
        if not isinstance(data, dict):
            return data

        form = DashboardEmbedForm(data)
        if form.is_valid():
            form.save()
            try:
                with transaction.atomic():
                    obj = form.save()
                    return Response(DashboardEmbedSerializer(obj).data)
            except Exception as e:
                return HttpResponseBadRequest(e)
        else:
            errors = [''.join(value) for key, value in form.errors.items()]
            return HttpResponseBadRequest('<br>'.join(errors))

    def post(self, request, slug):
        """Return Dashboard Embed list."""
        dashboard = get_object_or_404(Dashboard, slug=slug)
        return self.save(request, dashboard)
