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

import copy

from cloud_native_gis.models.layer import Layer
from cloud_native_gis.utils.pygeoapi_config import _layer_to_resource
from django.conf import settings
from django.db import connection
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
    ids = ContextLayer.permissions.list(request.user).values_list(
        'cloud_native_gis_layer_id', flat=True
    )
    return Layer.objects.filter(id__in=ids).order_by('id')


def get_resources(request: HttpRequest) -> dict:
    """Build a pygeoapi config dict with per-layer editability.

    Based on the requesting user's write permission on the associated
    ContextLayer.

    :param request: the current Django HTTP request
    :type request: HttpRequest
    :returns: pygeoapi config dict with ``resources`` populated
    :rtype: dict
    """
    allowed = ContextLayer.permissions.list(request.user)
    context_layer_map = {
        cl.cloud_native_gis_layer_id: cl
        for cl in allowed
        if cl.cloud_native_gis_layer_id is not None
    }
    qs = Layer.objects.filter(id__in=context_layer_map.keys()).order_by('id')
    db_settings = connection.settings_dict
    user = request.user if request.user.is_authenticated else None

    resources = {}
    for layer in qs:
        resource_id = str(layer.unique_id)
        context_layer = context_layer_map.get(layer.id)
        if context_layer is None:
            continue
        editable = context_layer.permission.has_edit_perm(user)
        resource = _layer_to_resource(layer, db_settings)
        resource['title']['en'] = context_layer.name
        resource['description']['en'] = context_layer.description
        resource['providers'][0]['editable'] = editable
        resources[resource_id] = resource

    # Get pygeoapi config and update resources
    config = copy.deepcopy(settings.PYGEOAPI_CONFIG)
    config['resources'] = resources
    return config
