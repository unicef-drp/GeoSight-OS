# coding=utf-8
"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

THIS IS PLUGIN.
"""

__author__ = 'irwan@kartoza.com'
__date__ = '27/05/2026'
__copyright__ = ('Copyright 2023, Unicef')

from cloud_native_gis.models.layer import Layer
from django.http import HttpRequest

from geosight.data.models.context_layer import ContextLayer


def get_queryset(request: HttpRequest):
    """
    Return the Layer queryset exposed as OGC API resources.

    Override this function in a subclass or by monkey-patching to apply
    custom filtering or permission logic (e.g. restrict to layers owned
    by the authenticated user).

    :param request: the current Django HTTP request
    :type request: HttpRequest
    :returns: queryset of :class:`~cloud_native_gis.models.layer.Layer` objects
    :rtype: django.db.models.QuerySet
    """
    ContextLayer.permissions.list(request.user)
    return Layer.objects.filter(
        id__in=ContextLayer.objects.all().values_list(
            'cloud_native_gis_layer_id', flat=True)
    )
