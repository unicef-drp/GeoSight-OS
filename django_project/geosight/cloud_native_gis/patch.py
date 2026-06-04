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

import base64
import copy
from functools import wraps

from cloud_native_gis.models.layer import Layer
from cloud_native_gis.utils.pygeoapi_config import _layer_to_resource
from django.conf import settings
from django.contrib.auth import authenticate
from django.db import connection
from django.http import HttpRequest, HttpResponse
from rest_framework.exceptions import AuthenticationFailed

from core.auth import BearerAuthentication
from geosight.data.models.context_layer import ContextLayer


def _unauthorized():
    """Return a 401 Unauthorized response."""
    response = HttpResponse(status=401)
    response['WWW-Authenticate'] = 'Bearer realm="GeoSight"'
    return response


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


def ogc_authenticate(view_func):
    """Optionally authenticate via Basic Auth or Bearer/Token.

    - No Authorization header: proceed as anonymous.
    - Valid Basic credentials: set request.user and proceed.
    - Valid Bearer/Token API key: set request.user and proceed.
    - Invalid credentials: return 401.
    """
    @wraps(view_func)
    def wrapper(request: HttpRequest, *args, **kwargs):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')

        if auth_header.startswith('Basic '):
            try:
                credentials = base64.b64decode(
                    auth_header[6:]
                ).decode('utf-8')
                username, password = credentials.split(':', 1)
                user = authenticate(
                    request, username=username, password=password
                )
                if user is not None:
                    request.user = user
                else:
                    return _unauthorized()
            except Exception:
                return _unauthorized()
        else:
            try:
                result = BearerAuthentication().authenticate(request)
                if result is not None:
                    request.user = result[0]
            except AuthenticationFailed:
                return _unauthorized()

        return view_func(request, *args, **kwargs)

    return wrapper